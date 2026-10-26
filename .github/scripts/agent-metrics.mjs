import { appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export class AgentMetrics {
  constructor(start = performance.now()) {
    this.start = start;
    this.responseStart = undefined;
    this.activeTools = new Map();
    this.toolStart = undefined;
    this.models = new Set();
    this.data = {
      assistantResponses: 0, assistantResponseMs: 0, toolWallMs: 0,
      retries: 0, compactions: 0, assistantErrors: 0, estimatedModelCostUsd: 0,
      tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0 },
      tools: {},
    };
  }

  record(event, now = performance.now()) {
    if (event.type === 'message_start' && event.message?.role === 'assistant') this.responseStart = now;
    if (event.type === 'message_end' && event.message?.role === 'assistant') {
      this.data.assistantResponses++;
      if (this.responseStart !== undefined) this.data.assistantResponseMs += now - this.responseStart;
      this.responseStart = undefined;
      if (event.message.model) this.models.add(event.message.model);
      for (const key of Object.keys(this.data.tokens)) this.data.tokens[key] += event.message.usage?.[key] ?? 0;
      this.data.estimatedModelCostUsd += event.message.usage?.cost?.total ?? 0;
      if (['error', 'aborted'].includes(event.message.stopReason)) this.data.assistantErrors++;
      console.log(`[metrics] assistant response ${this.data.assistantResponses} complete`);
    }
    if (event.type === 'tool_execution_start') {
      if (!this.activeTools.size) this.toolStart = now;
      this.activeTools.set(event.toolCallId, now);
    }
    if (event.type === 'tool_execution_end') {
      const started = this.activeTools.get(event.toolCallId);
      const duration = event.durationMs ?? (started === undefined ? 0 : now - started);
      const name = event.toolName.replace(/[^a-zA-Z0-9_]/g, '_');
      const tool = this.data.tools[name] ??= { calls: 0, errors: 0, totalMs: 0, maxMs: 0 };
      tool.calls++;
      tool.errors += Number(Boolean(event.isError));
      tool.totalMs += duration;
      tool.maxMs = Math.max(tool.maxMs, duration);
      this.activeTools.delete(event.toolCallId);
      if (!this.activeTools.size && this.toolStart !== undefined) {
        this.data.toolWallMs += now - this.toolStart;
        this.toolStart = undefined;
      }
      console.log(`[metrics] ${name}: ${Math.round(duration)}ms, error=${Boolean(event.isError)}`);
    }
    if (event.type === 'auto_retry_start') {
      this.data.retries++;
      console.log('[metrics] assistant retry');
    }
    if (event.type === 'compaction_start') this.data.compactions++;
  }

  snapshot(now = performance.now()) {
    return {
      ...this.data,
      wallMs: now - this.start,
      toolWallMs: this.data.toolWallMs + (this.toolStart === undefined ? 0 : now - this.toolStart),
      incompleteToolCalls: this.activeTools.size,
      actualModels: [...this.models],
    };
  }
}

async function main() {
  const metrics = new AgentMetrics();
  const eventPath = `${process.argv[2]}.events.jsonl`;
  writeFileSync(eventPath, '');
  let buffer = '';
  process.stdin.setEncoding('utf8');
  const record = (line) => {
    if (!line.trim()) return;
    let event;
    try { event = JSON.parse(line); }
    catch { throw new Error('Invalid pi JSON event (content withheld)'); }
    const now = performance.now();
    metrics.record(event, now);
    let safe;
    if (['message_start', 'message_end'].includes(event.type) && event.message?.role === 'assistant') {
      safe = { type: event.type };
      if (event.type === 'message_end') {
        safe.model = event.message.model;
        safe.usage = Object.fromEntries(Object.keys(metrics.data.tokens).map((key) => [key, event.message.usage?.[key] ?? 0]));
        safe.stopReason = event.message.stopReason;
      }
    } else if (['tool_execution_start', 'tool_execution_end'].includes(event.type)) {
      safe = { type: event.type, toolName: event.toolName?.replace(/[^a-zA-Z0-9_]/g, '_') };
      if (event.type === 'tool_execution_end') {
        safe.durationMs = event.durationMs;
        safe.isError = Boolean(event.isError);
      }
    } else if (event.type === 'auto_retry_start') {
      safe = { type: event.type, attempt: event.attempt, delayMs: event.delayMs };
    } else if (['compaction_start', 'compaction_end', 'agent_settled'].includes(event.type)) {
      safe = { type: event.type, aborted: event.aborted };
    }
    if (safe) appendFileSync(eventPath, `${JSON.stringify({ timestamp: new Date().toISOString(), elapsedMs: now - metrics.start, ...safe })}\n`);
  };
  try {
    // Split only on LF; Unicode line separators may occur inside JSON strings.
    for await (const chunk of process.stdin) {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf('\n')) !== -1) {
        record(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
      }
    }
    record(buffer);
  } finally {
    const summary = JSON.stringify({
      configuredModel: process.env.PI_MODEL,
      configuredThinking: process.env.PI_THINKING,
      ...metrics.snapshot(),
    }, null, 2);
    writeFileSync(process.argv[2], `${summary}\n`);
    console.log(`[metrics] summary\n${summary}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Agent timing\n\nModel response time includes API/network waits. Tool totalMs can overlap; toolWallMs counts overlap once. Cost is the model SDK estimate and excludes Exa.\n\n\`\`\`json\n${summary}\n\`\`\`\n`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();

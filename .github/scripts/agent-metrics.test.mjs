import assert from 'node:assert/strict';
import test from 'node:test';
import { AgentMetrics } from './agent-metrics.mjs';

test('counts usage once per completed assistant response and excludes message content', () => {
  const metrics = new AgentMetrics(0);
  metrics.record({ type: 'message_start', message: { role: 'assistant' } }, 10);
  metrics.record({ type: 'message_update', usage: { output: 5 } }, 20);
  metrics.record({ type: 'message_end', message: {
    role: 'assistant', model: 'deepseek-flash', content: 'PRIVATE CONTENT',
    usage: { input: 12, output: 8, cacheRead: 20, cacheWrite: 0, totalTokens: 40, cost: { total: 0.01 } },
  } }, 110);
  metrics.record({ type: 'agent_end', messages: [{ usage: { totalTokens: 40 } }] }, 120);
  const result = metrics.snapshot(130);
  assert.equal(result.assistantResponses, 1);
  assert.equal(result.assistantResponseMs, 100);
  assert.equal(result.tokens.totalTokens, 40);
  assert.equal(result.tokens.output, 8);
  assert.equal(result.estimatedModelCostUsd, 0.01);
  assert.deepEqual(result.actualModels, ['deepseek-flash']);
  assert.ok(!JSON.stringify(result).includes('PRIVATE CONTENT'));
});

test('distinguishes overlapping tool wall time from summed tool durations', () => {
  const metrics = new AgentMetrics(0);
  metrics.record({ type: 'tool_execution_start', toolCallId: 'a' }, 10);
  metrics.record({ type: 'tool_execution_start', toolCallId: 'b' }, 60);
  metrics.record({ type: 'tool_execution_end', toolCallId: 'a', toolName: 'fetch', durationMs: 100, isError: false }, 110);
  metrics.record({ type: 'tool_execution_end', toolCallId: 'b', toolName: 'fetch', durationMs: 100, isError: true }, 160);
  const result = metrics.snapshot(180);
  assert.equal(result.toolWallMs, 150);
  assert.deepEqual(result.tools.fetch, { calls: 2, errors: 1, totalMs: 200, maxMs: 100 });
});

test('tracks retries, compactions and unfinished executions without logging errors or arguments', () => {
  const metrics = new AgentMetrics(0);
  metrics.record({ type: 'auto_retry_start', errorMessage: 'PRIVATE KEY' }, 1);
  metrics.record({ type: 'compaction_start' }, 2);
  metrics.record({ type: 'tool_execution_start', toolCallId: 'a', args: { key: 'PRIVATE KEY' } }, 10);
  const result = metrics.snapshot(50);
  assert.equal(result.retries, 1);
  assert.equal(result.compactions, 1);
  assert.equal(result.incompleteToolCalls, 1);
  assert.equal(result.toolWallMs, 40);
  assert.ok(!JSON.stringify(result).includes('PRIVATE KEY'));
});

test('CLI consumes JSONL without exposing event payloads and writes a metrics file', async (t) => {
  const { mkdtempSync, readFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { spawnSync } = await import('node:child_process');
  const dir = mkdtempSync(join(tmpdir(), 'agent-metrics-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const output = join(dir, 'metrics.json');
  const events = [
    { type: 'message_start', message: { role: 'assistant' } },
    { type: 'message_end', message: { role: 'assistant', model: 'deepseek-flash', content: 'PRIVATE\u2028CONTENT', usage: { totalTokens: 12 } } },
  ];
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./agent-metrics.mjs', import.meta.url)), output], {
    input: events.map((event) => JSON.stringify(event)).join('\n'), encoding: 'utf8',
    env: { ...process.env, GITHUB_STEP_SUMMARY: join(dir, 'summary.md') },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(readFileSync(output, 'utf8')).tokens.totalTokens, 12);
  assert.ok(!result.stdout.includes('PRIVATE'));
  const eventLog = readFileSync(`${output}.events.jsonl`, 'utf8');
  const records = eventLog.trim().split('\n').map((line) => JSON.parse(line));
  assert.deepEqual(records.map((event) => event.type), ['message_start', 'message_end']);
  assert.ok(records.every((event) => typeof event.elapsedMs === 'number'));
  assert.ok(!eventLog.includes('PRIVATE'));
  assert.ok(!eventLog.includes('content'));
  assert.match(readFileSync(join(dir, 'summary.md'), 'utf8'), /Agent timing/);
});

test('CLI saves partial diagnostics and hides malformed input on failure', async (t) => {
  const { mkdtempSync, readFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { spawnSync } = await import('node:child_process');
  const dir = mkdtempSync(join(tmpdir(), 'agent-metrics-error-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const output = join(dir, 'metrics.json');
  const event = { type: 'tool_execution_start', toolCallId: 'test', toolName: 'mcp__exa__web_search_exa', args: { query: 'PRIVATE_ARG' } };
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./agent-metrics.mjs', import.meta.url)), output], {
    input: `${JSON.stringify(event)}\nPRIVATE_BAD_JSON`, encoding: 'utf8',
    env: { ...process.env, GITHUB_STEP_SUMMARY: '' },
  });
  assert.notEqual(result.status, 0);
  assert.equal(JSON.parse(readFileSync(output, 'utf8')).incompleteToolCalls, 1);
  assert.ok(!`${result.stdout}${result.stderr}${readFileSync(`${output}.events.jsonl`, 'utf8')}`.includes('PRIVATE_'));
});

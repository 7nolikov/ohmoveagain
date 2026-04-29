#!/usr/bin/env node
/**
 * Track B — Agent exploratory QA runner (QA_PLAN §4)
 *
 * Starts a Hugo server, runs a Claude agent against it using the Playwright MCP,
 * and writes findings to tests/reports/agent-qa-YYYY-MM-DD.md.
 * Exits non-zero if the verdict is NO-GO.
 *
 * Usage:
 *   node scripts/agent-qa.mjs
 *   BASE_URL=https://7nolikov.dev/ohmoveagain/ node scripts/agent-qa.mjs --no-server
 */

import { execSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPORTS_DIR = resolve(ROOT, 'tests/reports');
const PROMPT_FILE = resolve(__dirname, 'agent-qa-prompt.md');

const PORT = process.env.QA_PORT ?? '4000';
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}/ohmoveagain/`;
const NO_SERVER = process.argv.includes('--no-server');
const DATE = new Date().toISOString().slice(0, 10);
const REPORT_PATH = resolve(REPORTS_DIR, `agent-qa-${DATE}.md`);

mkdirSync(REPORTS_DIR, { recursive: true });

// ── Start Hugo server (unless --no-server) ───────────────────────────────────

let hugo;
if (!NO_SERVER) {
  console.log(`Starting Hugo server on port ${PORT}…`);
  hugo = spawn('hugo', ['server', '--port', PORT, '--disableFastRender'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Hugo server did not start within 30s')), 30_000);
    hugo.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Web Server is available')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    hugo.on('error', reject);
  });
  console.log('Hugo server ready.');
}

// ── Build agent prompt ────────────────────────────────────────────────────────

const promptTemplate = readFileSync(PROMPT_FILE, 'utf8');
const prompt = promptTemplate.replace(
  'http://localhost:4000/ohmoveagain/',
  BASE_URL
);

// ── Run Claude agent ──────────────────────────────────────────────────────────

const client = new Anthropic();

console.log(`Running agent QA against ${BASE_URL}…`);

const message = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 8096,
  system: `You are a strict QA engineer. You have access to a Playwright browser via MCP tools.
Complete the exploratory QA task described in the user message and write a structured report.
Be concise — one finding per issue, no repetition. Always end with a launch verdict.`,
  messages: [
    {
      role: 'user',
      content: prompt,
    },
  ],
});

const report = message.content
  .filter(block => block.type === 'text')
  .map(block => block.text)
  .join('\n');

// ── Write report ──────────────────────────────────────────────────────────────

const header = `# Agent QA Report — ${DATE}\n\n**Base URL:** ${BASE_URL}  \n**Model:** claude-opus-4-7  \n\n---\n\n`;
writeFileSync(REPORT_PATH, header + report, 'utf8');
console.log(`Report written to ${REPORT_PATH}`);

// ── Check verdict ─────────────────────────────────────────────────────────────

if (hugo) hugo.kill();

const verdict = report.includes('NO-GO') ? 'NO-GO' : 'GO';
console.log(`\nLaunch verdict: ${verdict}`);
if (verdict === 'NO-GO') {
  console.error('Agent found blocker issues — see report for details.');
  process.exit(1);
}

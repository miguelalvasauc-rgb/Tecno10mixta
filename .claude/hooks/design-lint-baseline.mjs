#!/usr/bin/env node
/**
 * Stop-hook wrapper around the Impeccable design detector.
 *
 * The vendored hook (.claude/skills/impeccable/scripts/hook.mjs) re-scans
 * every UI file touched this session on every Stop event. Its own session
 * cache is meant to dedupe repeats, but in practice this project kept
 * seeing the same preexisting findings re-reported turn after turn. Rather
 * than hand-edit the vendored hook scripts (the skill's own docs call those
 * "skill plumbing" not meant to be edited, and any local edit would be lost
 * on the next `npx skills update`), this wrapper sits in front of it:
 * it runs the real hook unchanged, then diffs the findings it reports
 * against a persistent snapshot in .claude/lint-baseline.json and only
 * forwards genuinely NEW findings to the model. A pass with nothing new
 * stays completely silent.
 *
 * On any parsing surprise (format drift in the vendored hook's output) this
 * fails OPEN — it forwards the original, unfiltered output rather than risk
 * hiding a real new finding.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
const impeccableHook = path.join(projectDir, '.claude', 'skills', 'impeccable', 'scripts', 'hook.mjs');
const baselinePath = path.join(projectDir, '.claude', 'lint-baseline.json');

const SINGLE_FILE_HEADER = /^\[impeccable@\d+\] Design hook findings requiring review in (.+) \(\d+ issue\(s\)\):$/;
const GROUPED_HEADER = /^\[impeccable@\d+\] Design hook findings requiring review across \d+ files? \(\d+ issue\(s\)\):$/;
const FILE_SUBHEADER = /^(.+) \((\d+) issue\(s\)\):$/;
const FINDING_LINE = /^- (?:L(\d+) )?\[([\w-]+)\]/;

function readStdinSync() {
  try {
    return fs.readFileSync(0, 'utf-8');
  } catch {
    return '';
  }
}

function loadBaseline() {
  try {
    const raw = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    if (raw && Array.isArray(raw.fingerprints)) return new Set(raw.fingerprints);
  } catch {
    /* missing or malformed: start from an empty baseline */
  }
  return new Set();
}

function saveBaseline(set) {
  try {
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(
      baselinePath,
      JSON.stringify(
        { version: 1, updatedAt: new Date().toISOString(), fingerprints: Array.from(set).sort() },
        null,
        2
      )
    );
  } catch {
    /* best-effort; a failed write just means this pass' findings may resurface once */
  }
}

// Returns [{ fingerprint, lineIndex }] — one entry per finding line found in
// the rendered additionalContext text, tagging each with the file it belongs
// to (from the single-file or grouped-template header) so the same rule+line
// in two different files doesn't collide.
function parseFindings(text) {
  const lines = text.split('\n');
  const entries = [];
  let currentFile = null;
  let inGrouped = false;

  lines.forEach((line, idx) => {
    const singleMatch = line.match(SINGLE_FILE_HEADER);
    if (singleMatch) {
      currentFile = singleMatch[1];
      return;
    }
    if (GROUPED_HEADER.test(line)) {
      inGrouped = true;
      return;
    }
    if (inGrouped && !line.startsWith('...')) {
      const subMatch = line.match(FILE_SUBHEADER);
      if (subMatch) {
        currentFile = subMatch[1];
        return;
      }
    }
    const findingMatch = line.match(FINDING_LINE);
    if (findingMatch) {
      const [, lineNo, rule] = findingMatch;
      const fingerprint = lineNo
        ? `${currentFile}::${rule}::${lineNo}`
        : `${currentFile}::${rule}::${line.slice(0, 80)}`;
      entries.push({ fingerprint, lineIndex: idx });
    }
  });

  return entries;
}

function passThrough(stdout) {
  if (stdout) process.stdout.write(stdout);
  process.exit(0);
}

const stdin = readStdinSync();
const child = spawnSync(process.execPath, [impeccableHook], {
  input: stdin,
  encoding: 'utf-8',
  env: process.env,
});

if (child.error || child.status !== 0) passThrough(child.stdout);
if (!child.stdout) passThrough('');

let payload;
try {
  payload = JSON.parse(child.stdout);
} catch {
  passThrough(child.stdout);
}

const text = payload?.hookSpecificOutput?.additionalContext;
if (!text) process.exit(0); // clean pass: nothing to report

const entries = parseFindings(text);
if (entries.length === 0) passThrough(child.stdout); // unrecognized format: fail open

const baseline = loadBaseline();
const newEntries = entries.filter((e) => !baseline.has(e.fingerprint));

const nextBaseline = new Set(baseline);
for (const e of entries) nextBaseline.add(e.fingerprint);
saveBaseline(nextBaseline);

if (newEntries.length === 0) process.exit(0); // nothing new since the last snapshot

const newLineIndexes = new Set(newEntries.map((e) => e.lineIndex));
const filteredText = text
  .split('\n')
  .filter((line, idx) => newLineIndexes.has(idx) || !FINDING_LINE.test(line))
  .join('\n');

const note = `\n\n[lint-baseline] ${newEntries.length} of ${entries.length} finding(s) above are new since the last .claude/lint-baseline.json snapshot; the rest were already known and are omitted. Header counts above are from the underlying scan and may not match what's shown.`;

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'Stop', additionalContext: filteredText + note },
  })
);
process.exit(0);

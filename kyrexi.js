#!/usr/bin/env node
/**
 * Kyrexi CLI v3.5 — Agentic Pro Update
 * Built for Kyrexi AI | https://kyrexi.udmodz.site
 * @license Apache-2.0
 * Copyright 2020-2026 UDMODZ
 * Edited and adavced by THENUX
 */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, appendFileSync, copyFileSync } from 'node:fs';
import { join, relative, resolve, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';
import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);


const KYREXI_DIR = join(homedir(), '.kyrexi');
const SETTINGS_PATH = join(KYREXI_DIR, 'settings.json');
const HISTORY_PATH = join(KYREXI_DIR, 'history.log');
const BASE_URL = process.env.KYREXI_BASE_URL || 'https://kyrexi.udmodz.site';
const API_KEY_ENV = process.env.KYREXI_API_KEY;
const VERSION = '3.7.0';


const args = process.argv.slice(2);
let IS_AGENTIC = args.includes('--agentic') || args.includes('-a');
let RESUME_SESSION = args.includes('--resume');
let DEBUG_MODE = args.includes('--debug');
let COMPACT_MODE = args.includes('--compact');
let SAFE_MODE = args.includes('--safe');
let CURRENT_THEME = process.env.KYREXI_THEME || 'neon';


const NO_COLOR = !!process.env.NO_COLOR;
const c = {
  reset: (s) => NO_COLOR ? s : `\x1b[0m${s}\x1b[0m`,
  bold: (s) => NO_COLOR ? s : `\x1b[1m${s}\x1b[0m`,
  dim: (s) => NO_COLOR ? s : `\x1b[2m${s}\x1b[0m`,
  italic: (s) => NO_COLOR ? s : `\x1b[3m${s}\x1b[0m`,
  brand: (s) => NO_COLOR ? s : `\x1b[38;2;34;211;160m${s}\x1b[0m`,
  accent: (s) => NO_COLOR ? s : `\x1b[38;2;139;92;246m${s}\x1b[0m`,
  gold: (s) => NO_COLOR ? s : `\x1b[38;2;255;215;0m${s}\x1b[0m`,
  red: (s) => NO_COLOR ? s : `\x1b[38;2;239;68;68m${s}\x1b[0m`,
  green: (s) => NO_COLOR ? s : `\x1b[38;2;16;185;129m${s}\x1b[0m`,
  yellow: (s) => NO_COLOR ? s : `\x1b[38;2;245;158;11m${s}\x1b[0m`,
  blue: (s) => NO_COLOR ? s : `\x1b[38;2;59;130;246m${s}\x1b[0m`,
  cyan: (s) => NO_COLOR ? s : `\x1b[38;2;6;182;212m${s}\x1b[0m`,
  gray: (s) => NO_COLOR ? s : `\x1b[38;2;107;114;128m${s}\x1b[0m`,
  bgBrand: (s) => NO_COLOR ? s : `\x1b[48;2;34;211;160m\x1b[38;2;0;0;0m${s}\x1b[0m`,
  bgAccent: (s) => NO_COLOR ? s : `\x1b[48;2;139;92;246m\x1b[38;2;255;255;255m${s}\x1b[0m`,
  pink: (s) => NO_COLOR ? s : `\x1b[38;2;236;72;153m${s}\x1b[0m`,
  orange: (s) => NO_COLOR ? s : `\x1b[38;2;249;115;22m${s}\x1b[0m`,
  lime: (s) => NO_COLOR ? s : `\x1b[38;2;132;204;22m${s}\x1b[0m`,
  white: (s) => NO_COLOR ? s : `\x1b[38;2;245;245;245m${s}\x1b[0m`,
  inverse: (s) => NO_COLOR ? s : `\x1b[7m${s}\x1b[0m`,
};

function createGradient(colors) {
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  const rgbColors = colors.map(hexToRgb);
  return (text) => {
    if (NO_COLOR) return text;
    const lines = text.split('\n');
    return lines.map(line => {
      let result = '';
      for (let i = 0; i < line.length; i++) {
        const ratio = i / (line.length - 1 || 1);
        const idx = ratio * (rgbColors.length - 1);
        const low = Math.floor(idx);
        const high = Math.ceil(idx);
        const w = idx - low;
        const r = Math.round(rgbColors[low][0] * (1 - w) + rgbColors[high][0] * w);
        const g = Math.round(rgbColors[low][1] * (1 - w) + rgbColors[high][1] * w);
        const b = Math.round(rgbColors[low][2] * (1 - w) + rgbColors[high][2] * w);
        result += `\x1b[38;2;${r};${g};${b}m${line[i]}\x1b[0m`;
      }
      return result;
    }).join('\n');
  };
}


const THEMES = {
  neon: ["#22d3ee", "#8b5cf6", "#22d3a0"],
  fire: ["#f97316", "#ef4444", "#facc15"],
  ocean: ["#0ea5e9", "#06b6d4", "#14b8a6"],
  candy: ["#ec4899", "#a855f7", "#22d3ee"],
  matrix: ["#22c55e", "#84cc16", "#16a34a"],
};

function themeColors() {
  return THEMES[CURRENT_THEME] || THEMES.neon;
}

function gradientText(text, theme = CURRENT_THEME) {
  return createGradient(THEMES[theme] || themeColors())(text);
}

function nowStamp() {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

function logDebug(...parts) {
  if (DEBUG_MODE) console.log(c.dim(c.gray(`[debug ${nowStamp()}] ${parts.join(' ')}`)));
}

function ensureKyrexiDirs() {
  if (!existsSync(KYREXI_DIR)) mkdirSync(KYREXI_DIR, { recursive: true });
  const backups = join(KYREXI_DIR, 'backups');
  if (!existsSync(backups)) mkdirSync(backups, { recursive: true });
}

function backupFile(filePath) {
  try {
    ensureKyrexiDirs();
    if (!existsSync(filePath) || !statSync(filePath).isFile()) return null;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = join(KYREXI_DIR, 'backups', `${basename(filePath)}.${stamp}.bak`);
    copyFileSync(filePath, target);
    return target;
  } catch (e) {
    logDebug('backup failed:', e.message);
    return null;
  }
}

function listBackups(limit = 20) {
  try {
    ensureKyrexiDirs();
    const dir = join(KYREXI_DIR, 'backups');
    return readdirSync(dir)
      .map(name => ({ name, path: join(dir, name), time: statSync(join(dir, name)).mtimeMs, size: statSync(join(dir, name)).size }))
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  } catch (e) {
    logDebug('list backups failed:', e.message);
    return [];
  }
}

function readSettingsSafe() {
  return safeJsonParse(existsSync(SETTINGS_PATH) ? readFileSync(SETTINGS_PATH, 'utf8') : '{}', {}) || {};
}

function writeSettingsSafe(next) {
  ensureKyrexiDirs();
  writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2));
}

function maskSecret(value = '') {
  const s = String(value || '');
  if (!s) return '(empty)';
  if (s.length <= 8) return '********';
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

async function runDoctor(client, token) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
  add('Node.js runtime', Number(process.versions.node.split('.')[0]) >= 18, `v${process.versions.node}`);
  add('Settings directory', existsSync(KYREXI_DIR), KYREXI_DIR);
  add('API token', !!token, maskSecret(token));
  add('Current directory', existsSync(CURRENT_CWD), CURRENT_CWD);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify?token=${token}`, { headers: { 'User-Agent': `Kyrexi-CLI/${VERSION}` } });
    add('Server auth verify', res.ok, `${res.status}`);
  } catch (e) {
    add('Server auth verify', false, e.message);
  }
  try {
    const chats = await client.listChats();
    add('Chat API', Array.isArray(chats), `${Array.isArray(chats) ? chats.length : 0} sessions visible`);
  } catch (e) {
    add('Chat API', false, e.message);
  }
  return checks.join('\n');
}

function appendHistory(role, text) {
  try {
    ensureKyrexiDirs();
    appendFileSync(HISTORY_PATH, `\n[${nowStamp()}] ${role}\n${String(text).slice(0, 6000)}\n`, 'utf8');
  } catch (e) {
    logDebug('history write failed:', e.message);
  }
}

function trimForTerminal(text, max = 16000) {
  const s = String(text ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n\n[Kyrexi trimmed ${s.length - max} characters for terminal safety]`;
}

function safeJsonParse(text, fallback = null) {
  try { return JSON.parse(text); } catch { return fallback; }
}

function parseToolCall(rawCall) {
  let rawJson = rawCall.trim().replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
  let sanitizedJson = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < rawJson.length; i++) {
    const char = rawJson[i];
    if (char === '"' && !escaped) { inString = !inString; sanitizedJson += char; }
    else if (char === '\\' && inString && !escaped) { escaped = true; sanitizedJson += char; }
    else {
      if (inString) {
        if (char === '\n') sanitizedJson += '\\n';
        else if (char === '\r') sanitizedJson += '\\r';
        else if (char === '\t') sanitizedJson += '\\t';
        else sanitizedJson += char;
      } else sanitizedJson += char;
      escaped = false;
    }
  }
  const parsed = JSON.parse(sanitizedJson);
  const call = {
    name: parsed.name || parsed.tool || parsed.action || parsed.type,
    parameters: parsed.parameters || parsed.args || parsed.params || parsed
  };
  if (call.name && call.parameters === parsed) {
    const { name, tool, action, type, parameters, args, params, ...rest } = parsed;
    call.parameters = rest;
  }
  const p = call.parameters || {};
  if (p.param1 || p.param2) {
    if (call.name === 'write_file') { p.path = p.param1; p.content = p.param2; }
    if (call.name === 'run_command') p.command = p.param1;
    if (call.name === 'list_dir') p.path = p.param1;
  }
  call.parameters = p;
  return call;
}

function isCommandDangerous(command = '') {
  const normalized = String(command).toLowerCase();
  return /\b(rm\s+-rf|del\s+\/|format\b|mkfs\b|shutdown\b|reboot\b|sudo\b|chmod\s+777|curl\s+.*\|\s*sh|wget\s+.*\|\s*sh)\b/.test(normalized);
}

function validateToolCall(name, parameters = {}) {
  if (!name) return { ok: false, reason: 'Missing tool name.' };
  if (SAFE_MODE && ['delete_file', 'run_background_command'].includes(name)) {
    return { ok: false, reason: `SAFE_MODE blocked ${name}.` };
  }
  if (name === 'run_command' && isCommandDangerous(parameters.command)) {
    return { ok: false, reason: 'Dangerous shell command blocked. Use a safer command or disable SAFE_MODE only if you trust the action.' };
  }
  return { ok: true };
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = n, i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value.toFixed(i ? 1 : 0)} ${units[i]}`;
}

function usageMeter(label, used, total) {
  const width = 24;
  const pct = total ? Math.min(1, used / total) : 0;
  const filled = Math.round(pct * width);
  const bar = `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
  return `${label}: ${bar} ${(pct * 100).toFixed(0)}%`;
}

const ICONS = {
  robot: '🤖',
  think: '🧠',
  tool: '🛠️',
  check: '✅',
  warn: '⚠️',
  user: '👤',
  flash: '⚡',
  lock: '🔒',
  plus: '➕',
  minus: '➖',
  error: '❌',
  info: 'ℹ️',
  spark: '✨',
  folder: '📁',
  file: '📄',
  clock: '⏱️',
};


const mission1 = `MISSION: STANDARD AUTONOMY
You are Kyrexi CLI's terminal-native coding agent.
Rules:
- Keep answers practical, concise, and production-ready.
- Use tools when needed, but explain important destructive actions.
- Prefer safe edits: inspect files before modifying, create focused changes, run checks when possible.
- When coding, return complete working code, not placeholders.
- Never expose API keys, secrets, cookies, or tokens.
- If unsure, gather context with list_dir/read_file/search_files before editing.`;
const mission2 = `MISSION: ERROR RESOLUTION
You are Kyrexi CLI's autonomous fixer.
Rules:
- Diagnose root cause first, then patch the minimal files needed.
- Run or suggest verification commands after fixing.
- Preserve existing behavior unless the user requests a redesign.
- Avoid destructive commands. Never delete user data unless explicitly requested.
- Summarize what changed and why.`;


const backgroundProcesses = new Map();
let CURRENT_CWD = process.cwd();
let contextSummary = '';
let preAuthorizedCount = 0;


const Tools = {
  async list_dir({ path = '.' }) {
    try {
      const targetPath = resolve(CURRENT_CWD, path);
      const entries = readdirSync(targetPath);
      return entries.map(e => {
        const full = join(targetPath, e);
        const isDir = statSync(full).isDirectory();
        return `${isDir ? 'DIR' : 'FILE'} ${e}`;
      }).join('\n');
    } catch (e) { return `Error: ${e.message}`; }
  },
  async read_file({ path }) {
    try { return readFileSync(resolve(CURRENT_CWD, path), 'utf8'); } catch (e) { return `Error: ${e.message}`; }
  },
  async write_file({ path, content }) {
    try {
      const fullPath = resolve(CURRENT_CWD, path);
      const dir = dirname(fullPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const backup = backupFile(fullPath);
      writeFileSync(fullPath, content, 'utf8');
      return `Successfully created/updated ${path} (${content.length} bytes)${backup ? `\nBackup: ${backup}` : ''}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async edit_file({ path, search, replace, replaceAll = false }) {
    try {
      const fullPath = resolve(CURRENT_CWD, path);
      const content = readFileSync(fullPath, 'utf8');
      const backup = backupFile(fullPath);
      if (!content.includes(search)) return `Error: Search string not found in ${path}`;
      const updated = replaceAll ? content.split(search).join(replace) : content.replace(search, replace);
      writeFileSync(fullPath, updated, 'utf8');
      return `Successfully applied edit to ${path}${replaceAll ? ' (all occurrences replaced)' : ''}${backup ? `\nBackup: ${backup}` : ''}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async multi_edit_file({ path, changes }) {
    try {
      const fullPath = resolve(CURRENT_CWD, path);
      let content = readFileSync(fullPath, 'utf8');
      const backup = backupFile(fullPath);
      for (const change of changes) {
        if (!content.includes(change.search)) return `Error: Search string "${change.search}" not found in ${path}`;
        content = content.replace(change.search, change.replace);
      }
      writeFileSync(fullPath, content, 'utf8');
      return `Successfully applied ${changes.length} edits to ${path}${backup ? `\nBackup: ${backup}` : ''}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async run_command({ command, timeoutMs = 120000 }) {
    const commandPromise = new Promise((resolvePromise) => {
      try {
        let cmd = command.trim();
        const isWin = process.platform === 'win32';

        const isSimpleCd = /^cd\s+[^&;|]+$/i.test(cmd);
        if (isSimpleCd) {
          const newDir = resolve(CURRENT_CWD, cmd.slice(3).trim());
          if (existsSync(newDir) && statSync(newDir).isDirectory()) {
            CURRENT_CWD = newDir;
            return resolvePromise(`Changed directory to: ${CURRENT_CWD}`);
          } else {
            return resolvePromise(`Error: Directory not found: ${newDir}`);
          }
        }

        const sentinel = "__KYREXI_CWD__";
        if (isWin) {
          cmd = `${cmd} & echo. & echo ${sentinel} & cd`;
        } else {
          cmd = `${cmd} ; echo ; echo "${sentinel}" ; pwd`;
        }

        const shell = isWin ? 'cmd.exe' : '/bin/sh';
        const shellArgs = isWin ? ['/d', '/s', '/c', cmd] : ['-c', cmd];
        const proc = spawn(shell, shellArgs, {
          cwd: CURRENT_CWD,
          stdio: [process.stdin.isTTY ? 'inherit' : 'ignore', 'pipe', 'pipe'],
          ...(isWin ? { windowsVerbatimArguments: true } : {})
        });

        let stdout = '', stderr = '', printedLength = 0, foundSentinel = false;

        proc.stdout.on('data', (data) => {
          const chunk = data.toString();
          stdout += chunk;
          if (foundSentinel) return;
          const sentinelIdx = stdout.indexOf(sentinel);
          if (sentinelIdx !== -1) {
            foundSentinel = true;
            const toPrint = stdout.substring(printedLength, sentinelIdx);
            if (toPrint.length > 0) process.stdout.write(toPrint);
          } else {
            const toPrint = stdout.substring(printedLength);
            process.stdout.write(toPrint);
            printedLength = stdout.length;
          }
        });

        proc.stderr.on('data', (data) => { const chunk = data.toString(); stderr += chunk; process.stderr.write(chunk); });
        proc.on('error', (err) => resolvePromise(`Error starting command: ${err.message}`));
        proc.on('close', (code) => {
          const sentinelIdx = stdout.indexOf(sentinel);
          if (sentinelIdx !== -1) {
            const afterSentinel = stdout.substring(sentinelIdx + sentinel.length).trim();
            const lines = afterSentinel.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length > 0) {
              const potentialDir = resolve(CURRENT_CWD, lines[0]);
              if (existsSync(potentialDir) && statSync(potentialDir).isDirectory()) CURRENT_CWD = potentialDir;
            }
          }
          let cleanStdout = sentinelIdx !== -1 ? stdout.substring(0, sentinelIdx).trimEnd() : stdout;
          resolvePromise(cleanStdout + (stderr ? `\nSTDERR:\n${stderr}` : '') + `\n[Process exited with code ${code}]`);
        });
      } catch (e) { resolvePromise(`Error: ${e.message}`); }
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Command timed out after ${timeoutMs}ms`)), timeoutMs)
    );
    try { return await Promise.race([commandPromise, timeoutPromise]); } catch (e) { return `Error: ${e.message}`; }
  },
  async run_background_command({ command }) {
    try {
      const id = Math.random().toString(36).substring(7);
      const proc = exec(command, { cwd: CURRENT_CWD });
      let output = '';
      proc.stdout.on('data', (data) => output += data);
      proc.stderr.on('data', (data) => output += data);
      backgroundProcesses.set(id, { proc, output, status: 'running' });
      proc.on('exit', (code) => {
        const data = backgroundProcesses.get(id);
        if (data) {
          data.status = `done (exit code ${code})`;
          data.output += `\n[PROCESS EXITED WITH CODE ${code}]`;
        }
      });
      return `Started background command with ID: ${id}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async get_command_status({ id }) {
    const data = backgroundProcesses.get(id);
    if (!data) return 'Error: Command ID not found.';
    return `Status: ${data.status}\nOutput:\n${data.output}`;
  },
  async search_files({ query, path = '.' }) {
    try {
      const cmd = process.platform === 'win32' ? `findstr /s /i /c:"${query}" "${path}\\*"` : `grep -rn "${query}" "${path}" | head -n 20`;
      const { stdout } = await execAsync(cmd, { cwd: CURRENT_CWD });
      return stdout || 'No results.';
    } catch (e) { return 'No results.'; }
  },
  async search_web({ query }) {
    try {
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await res.text();
      const snippets = [...html.matchAll(/class="result__snippet"[^>]*>(.*?)<\/a>/gs)]
        .slice(0, 6)
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
      const titles = [...html.matchAll(/class="result__a"[^>]*>(.*?)<\/a>/gs)]
        .slice(0, 6)
        .map(m => m[1].replace(/<[^>]+>/g, '').trim());
      if (snippets.length === 0) return `No results found for: ${query}. Try read_url with a direct URL.`;
      let result = `Search results for: "${query}"\n\n`;
      snippets.forEach((s, i) => { result += `${i + 1}. ${titles[i] || 'Result'}\n   ${s}\n\n`; });
      return result;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async read_url({ url }) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
      return `[URL: ${url}]\n\n${text.substring(0, 12000)}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async generate_image({ prompt }) {
    try {
      let token = process.env.KYREXI_API_KEY;
      if (!token && existsSync(SETTINGS_PATH)) {
        try {
          const settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
          token = settings.token;
        } catch (e) { }
      }

      const res = await fetch(`${BASE_URL}/api/image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-kyrexi-token': token,
          'User-Agent': `Kyrexi-CLI`
        },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (!data.image) throw new Error(data.error || 'Failed to generate image');

      const base64Data = data.image.split(',')[1] || data.image;
      const fileName = `kyrexi_gen_${Date.now()}.png`;
      writeFileSync(fileName, Buffer.from(base64Data, 'base64'));
      return `Image generated and saved to ${fileName}.`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async ask_user({ question }) {
    return `[USER RESPONSE REQUIRED] This tool is not automated. Please ask the user directly in your response text instead.`;
  },
  async get_sys_info() {
    try {
      const os = await import('node:os');
      const info = {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        cpus: os.cpus().map(c => c.model)[0],
        totalMem: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMem: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        cwd: CURRENT_CWD
      };
      return JSON.stringify(info, null, 2);
    } catch (e) { return `Error: ${e.message}`; }
  },
  async delete_file({ path }) {
    try {
      const { unlinkSync } = await import('node:fs');
      const target = resolve(CURRENT_CWD, path);
      if (existsSync(target) && statSync(target).isFile()) {
        unlinkSync(target);
        return `Successfully deleted file: ${path}`;
      }
      return `Error: Target not found or is a directory: ${path}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async copy_file({ from, to }) {
    try {
      const { copyFileSync } = await import('node:fs');
      const src = resolve(CURRENT_CWD, from);
      const dest = resolve(CURRENT_CWD, to);
      const dir = dirname(dest);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      copyFileSync(src, dest);
      return `Successfully copied ${from} to ${to}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async make_http_request({ url, method = 'GET', headers = {}, body = null }) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers }
      };
      if (body) {
        options.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
      }
      const res = await fetch(url, options);
      const text = await res.text();
      return `Status: ${res.status}\nHeaders: ${JSON.stringify([...res.headers.entries()])}\nBody:\n${text.substring(0, 10000)}`;
    } catch (e) { return `Error: ${e.message}`; }
  },
  async append_file({ path, content }) {
    try {
      const fullPath = resolve(CURRENT_CWD, path);
      const dir = dirname(fullPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      appendFileSync(fullPath, content, 'utf8');
      return `Successfully appended ${content.length} bytes to ${path}`;
    } catch (e) { return `Error: ${e.message}`; }
  }
};


const ASCII_FONT = {
  A: [" ▄▄▄▄ ", "█    █", "█▄▄▄▄█", "█    █", "█    █"],
  B: ["▄▄▄▄▄ ", "█    █", "█████ ", "█    █", "█████ "],
  C: [" ▄▄▄▄ ", "█     ", "█     ", "█     ", " ▀▀▀▀ "],
  D: ["▄▄▄▄  ", "█   █ ", "█    █", "█   █ ", "████  "],
  E: ["██████", "█     ", "████  ", "█     ", "██████"],
  F: ["██████", "█     ", "████  ", "█     ", "█     "],
  G: [" ▄▄▄▄ ", "█     ", "█  ▄▄█", "█    █", " ▀▀▀▀ "],
  H: ["█    █", "█    █", "██████", "█    █", "█    █"],
  I: ["██████", "  ██  ", "  ██  ", "  ██  ", "██████"],
  J: ["██████", "    ██", "    ██", "█   ██", " ▀██▀ "],
  K: ["█   ██", "█  ██ ", "████  ", "█  ██ ", "█   ██"],
  L: ["█     ", "█     ", "█     ", "█     ", "██████"],
  M: ["█    █", "██  ██", "█ ██ █", "█    █", "█    █"],
  N: ["█    █", "██   █", "█ █  █", "█  █ █", "█    █"],
  O: [" ▄▄▄▄ ", "█    █", "█    █", "█    █", " ▀▀▀▀ "],
  P: ["█████ ", "█    █", "█████ ", "█     ", "█     "],
  Q: [" ▄▄▄▄ ", "█    █", "█ █  █", "█  ▀▀█", " ▀▀▀▀▀"],
  R: ["█████ ", "█    █", "█████ ", "█  ██ ", "█   ██"],
  S: [" ▄▄▄▄ ", "█     ", " ▀▀▀▀▄", "     █", "█████▀"],
  T: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
  U: ["█    █", "█    █", "█    █", "█    █", " ▀██▀ "],
  V: ["█    █", "█    █", " █  █ ", " █  █ ", "  ██  "],
  W: ["█    █", "█    █", "█ ██ █", "██  ██", "█    █"],
  X: ["█    █", " █  █ ", "  ██  ", " █  █ ", "█    █"],
  Y: ["█    █", " █  █ ", "  ██  ", "  ██  ", "  ██  "],
  Z: ["██████", "    █ ", "  █▀  ", " █    ", "██████"],
  " ": ["      ", "      ", "      ", "      ", "      "],
  "-": ["      ", "      ", "██████", "      ", "      "],
  "!": ["  ██  ", "  ██  ", "  ██  ", "      ", "  ██  "],
  ".": ["      ", "      ", "      ", "      ", "  ██  "],
};

function renderAsciiText(text) {
  const cleanText = String(text).toUpperCase();
  const fontHeight = 5;
  const lines = Array(fontHeight).fill('');
  
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const glyph = ASCII_FONT[char] || ASCII_FONT[" "];
    for (let h = 0; h < fontHeight; h++) {
      lines[h] += glyph[h] + "  ";
    }
  }
  return "\n" + lines.map(line => line.trimEnd()).join('\n') + "\n";
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

function printBox(title, content, color = c.brand) {
  const lines = content.split('\n');
  const cols = process.stdout.columns || 80;
  const maxWidth = Math.max(40, cols - 12);

  const formattedLines = [];
  lines.forEach(line => {
    const visLen = stripAnsi(line).length;
    if (visLen <= maxWidth) {
      formattedLines.push(line);
    } else {
      if (line.includes('\x1b')) {
        formattedLines.push(line);
      } else {
        let remaining = line;
        while (remaining.length > 0) {
          formattedLines.push(remaining.substring(0, maxWidth));
          remaining = remaining.substring(maxWidth);
        }
      }
    }
  });

  const maxVisLen = Math.max(
    title.length + 6,
    ...formattedLines.map(l => stripAnsi(l).length)
  );

  const innerW = maxVisLen + 4;

  const top = `╭── ${c.bold(title)} ${'─'.repeat(innerW - title.length - 6)}╮`;
  const bottom = `╰${'─'.repeat(innerW)}╯`;

  console.log(`\n  ${color(top)}`);
  formattedLines.forEach(line => {
    const visLen = stripAnsi(line).length;
    const paddingNeeded = innerW - visLen - 4;
    const padding = ' '.repeat(Math.max(0, paddingNeeded));
    console.log(`  ${color('│')}  ${c.reset(line)}${padding}  ${color('│')}`);
  });
  console.log(`  ${color(bottom)}\n`);
}

function printStatus(text, icon = '•', color = c.dim) {
  process.stdout.write(`  ${color(icon)} ${c.gray(text)}\n`);
}

async function printBranding() {
  const settings = readSettingsSafe();
  const banner = settings.customBanner !== undefined ? settings.customBanner : `
   ██╗  ██╗██╗   ██╗██████╗ ███████╗██╗  ██╗██╗
   ██║ ██╔╝╚██╗ ██╔╝██╔══██╗██╔════╝╚██╗██╔╝██║
   █████╔╝  ╚████╔╝ ██████╔╝█████╗   ╚███╔╝ ██║
   ██╔═██╗   ╚██╔╝  ██╔══██╗██╔══╝   ██╔██╗ ██║
   ██║  ██╗   ██║   ██║  ██║███████╗██╔╝ ██╗██║
   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝
  `;
  if (banner) {
    console.log(gradientText(banner));
  }
  const customCreator = settings.customCreator || `Kyrexi Pro`;
  const badges = [CURRENT_THEME, IS_AGENTIC ? 'agentic' : 'guarded', SAFE_MODE ? 'safe' : 'standard', DEBUG_MODE ? 'debug' : null].filter(Boolean).join(' • ');
  console.log(c.bold(c.brand(`  ${customCreator} v${VERSION}`)) + ' ' + c.dim(c.gray(`[${badges}]`)));
  console.log(c.gray('  ─────────────────────────────────────────────────────────────────\n'));
}


async function runAgenticLoop(client, initialMessage, rl, isFixMode = false) {
  const MAX_STEPS = 1000;
  let message = initialMessage;
  const prmpt = isFixMode ? mission2 : mission1;
  const settings = readSettingsSafe();
  const customName = settings.customName || 'Kyrexi';

  const stdinDataListeners = process.stdin.listeners('data');
  const stdinKeypressListeners = process.stdin.listeners('keypress');
  const stdinReadableListeners = process.stdin.listeners('readable');

  for (const l of stdinDataListeners) process.stdin.removeListener('data', l);
  for (const l of stdinKeypressListeners) process.stdin.removeListener('keypress', l);
  for (const l of stdinReadableListeners) process.stdin.removeListener('readable', l);

  rl.pause();
  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      let fullResponse = '';
      let inThinking = false;
      let inToolCall = false;
      let toolResults = [];
      let buffer = '';

      process.stdout.write(`\n  ${c.brand(ICONS.robot + (isFixMode ? ' Fixer › ' : ` ${customName} › `))}`);

      for await (const chunk of client.stream(message, prmpt)) {
        fullResponse += chunk;
        buffer += chunk;

        if (!inThinking && buffer.includes('<thinking>')) {
          inThinking = true;
          process.stdout.write(`\n  ${c.cyan(ICONS.think + ' Thinking Process ')}\n`);
          buffer = buffer.split('<thinking>')[1] || '';
        }
        if (inThinking && buffer.includes('</thinking>')) {
          const thought = buffer.split('</thinking>')[0];
          process.stdout.write(c.italic(c.gray('  ' + thought.trim().replace(/\n/g, '\n  '))));
          inThinking = false;
          process.stdout.write('\n\n  ' + c.brand(ICONS.robot + ' Response › '));
          buffer = buffer.split('</thinking>')[1] || '';
        }

        if (!inToolCall && buffer.includes('<tool_call>')) {
          inToolCall = true;
          buffer = buffer.split('<tool_call>')[1] || '';
        }

        if (inToolCall && buffer.includes('</tool_call>')) {
          const rawCall = buffer.split('</tool_call>')[0];
          inToolCall = false;
          buffer = buffer.split('</tool_call>')[1] || '';

          try {
            let rawJson = rawCall.trim().replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
            let sanitizedJson = '';
            let inString = false;
            let escaped = false;
            for (let i = 0; i < rawJson.length; i++) {
              const char = rawJson[i];
              if (char === '"' && !escaped) {
                inString = !inString;
                sanitizedJson += char;
              } else if (char === '\\' && inString && !escaped) {
                escaped = true;
                sanitizedJson += char;
              } else {
                if (inString) {
                  if (char === '\n') {
                    sanitizedJson += '\\n';
                  } else if (char === '\r') {
                    if (rawJson[i + 1] === '\n') {
                      sanitizedJson += '\\n';
                      i++;
                    } else {
                      sanitizedJson += '\\r';
                    }
                  } else if (char === '\t') {
                    sanitizedJson += '\\t';
                  } else {
                    sanitizedJson += char;
                  }
                } else {
                  sanitizedJson += char;
                }
                escaped = false;
              }
            }
            const parsed = JSON.parse(sanitizedJson);
            const call = {
              name: parsed.name || parsed.tool || parsed.action || parsed.type,
              parameters: parsed.parameters || parsed.args || parsed.params || parsed
            };
            if (call.name && call.parameters === parsed) {
              const { name, tool, action, type, parameters, args, params, ...rest } = parsed;
              call.parameters = rest;
            }

            const p = call.parameters;
            if (p.param1 || p.param2) {
              if (call.name === 'write_file') { p.path = p.param1; p.content = p.param2; }
              if (call.name === 'run_command') p.command = p.param1;
              if (call.name === 'list_dir') p.path = p.param1;
            }

            if (call.name && Tools[call.name]) {
              const paramsString = Object.entries(call.parameters)
                .map(([k, v]) => `${k}: ${String(v).substring(0, 100)}`)
                .join('\n');
              printBox(`ACTION: ${call.name.toUpperCase()}`, paramsString, c.accent);

              const dangerous = ['run_command', 'write_file', 'edit_file', 'multi_edit_file', 'run_background_command', 'delete_file', 'copy_file', 'make_http_request'];
              let authorized = IS_AGENTIC;
              if (!authorized && preAuthorizedCount > 0 && dangerous.includes(call.name)) {
                preAuthorizedCount--;
                printStatus(`Pre-authorized (${preAuthorizedCount} remaining)`, ICONS.flash, c.yellow);
                authorized = true;
              }
              if (!authorized) {
                if (dangerous.includes(call.name)) {

                  try {
                    process.stdin.resume();
                    while (process.stdin.read() !== null) { }
                  } catch (e) { }
                  rl.line = '';
                  rl.cursor = 0;


                  for (const l of stdinDataListeners) process.stdin.on('data', l);
                  for (const l of stdinKeypressListeners) process.stdin.on('keypress', l);
                  for (const l of stdinReadableListeners) process.stdin.on('readable', l);

                  rl.resume();
                  const confirm = await new Promise(r => rl.question(`  ${c.yellow(ICONS.warn + ' Authorize this action? [y/N] ')}`, r));


                  rl.pause();
                  for (const l of stdinDataListeners) process.stdin.removeListener('data', l);
                  for (const l of stdinKeypressListeners) process.stdin.removeListener('keypress', l);
                  for (const l of stdinReadableListeners) process.stdin.removeListener('readable', l);

                  const confClean = confirm.toLowerCase().trim();
                  authorized = confClean === 'y' || confClean === 'yes' || confClean === 'ok';
                } else { authorized = true; }
              }

              if (authorized) {
                printStatus('Executing...', '⏳', c.accent);
                const result = await Tools[call.name](call.parameters);
                printStatus('Completed.', ICONS.check, c.green);
                toolResults.push(`TOOL_RESULT for ${call.name}:\n${result}`);
                if (['write_file', 'append_file'].includes(call.name)) {
                  const entry = `Created/updated: ${call.parameters.path}`;
                  if (!contextSummary.includes(entry)) contextSummary += (contextSummary ? '\n' : '') + `- ${entry}`;
                }
              } else {
                toolResults.push(`REJECTED: User did not approve ${call.name}.`);
              }
            }
          } catch (e) { toolResults.push(`ERROR: Failed to process tool call. ${e.message}`); }

          process.stdout.write(`\n  ${c.brand(ICONS.robot + ' Continuing... ')}`);
        }

        if (!inThinking && !inToolCall && buffer.length > 0) {
          if (!buffer.includes('<')) {
            process.stdout.write(buffer);
            buffer = '';
          } else if (buffer.length > 20) {
            process.stdout.write(buffer);
            buffer = '';
          }
        }
      }

      process.stdout.write('\n');
      if (toolResults.length === 0) break;
      message = toolResults.join('\n\n---\n\n');
      if (step === MAX_STEPS - 1) {
        console.log(c.yellow(`\n  ${ICONS.warn} We have reached our safety step limit (${MAX_STEPS})! I will pause here so we can review together sweet friend! 🥺💕`));
      }
    }
  } finally {

    for (const l of stdinDataListeners) {
      if (!process.stdin.listeners('data').includes(l)) {
        process.stdin.on('data', l);
      }
    }
    for (const l of stdinKeypressListeners) {
      if (!process.stdin.listeners('keypress').includes(l)) {
        process.stdin.on('keypress', l);
      }
    }
    for (const l of stdinReadableListeners) {
      if (!process.stdin.listeners('readable').includes(l)) {
        process.stdin.on('readable', l);
      }
    }
    rl.resume();
  }
}


async function runSilentAgenticLoop(client, message, isFixMode = true) {
  let toolResults = [];
  let buffer = '';
  const prmpt = isFixMode ? mission2 : mission1;
  let fullResponse = '';

  for await (const chunk of client.stream(message, prmpt)) {
    fullResponse += chunk;
    buffer += chunk;

    if (buffer.includes('<tool_call>')) {
      const parts = buffer.split('<tool_call>');
      const callPart = parts[1].split('</tool_call>');

      if (callPart.length > 1) {
        const rawCall = callPart[0];
        buffer = callPart[1];

        try {
          const call = parseToolCall(rawCall);
          const validation = validateToolCall(call.name, call.parameters);
          if (!validation.ok) {
            toolResults.push(`BLOCKED: ${validation.reason}`);
          } else if (call.name && Tools[call.name]) {

            const result = await Tools[call.name](call.parameters);
            toolResults.push(`TOOL_RESULT for ${call.name}:\n${result}`);
          }
        } catch (e) { toolResults.push(`ERROR: Failed to process tool call. ${e.message}`); }
      }
    }
  }

  if (toolResults.length > 0) {
    return await runSilentAgenticLoop(client, toolResults.join('\n\n---\n\n'), isFixMode);
  }
  return fullResponse;
}


class KyrexiClient {
  constructor(token) { this.token = token; this.chatId = null; }
  _headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'x-kyrexi-token': this.token,
      'User-Agent': `Kyrexi-CLI/${VERSION}`
    };
  }
  async init() {
    try {
      const res = await fetch(`${BASE_URL}/api/chats`, {
        method: 'POST',
        headers: this._headers()
      });
      if (!res.ok) throw new Error(`Init Failed: ${res.status}`);
      const data = await res.json();
      this.chatId = data.id;
    } catch (e) {
      console.error(c.red(`  ${ICONS.error} Connection Error: ${e.message}`));
      process.exit(1);
    }
  }
  async listChats() {
    const res = await fetch(`${BASE_URL}/api/chats?userId=${this.token}`, { headers: this._headers() });
    return res.ok ? await res.json() : [];
  }
  async deleteChat(id) {
    const res = await fetch(`${BASE_URL}/api/chats/${id || this.chatId}`, { method: 'DELETE', headers: this._headers() });
    if (res.ok && (!id || id === this.chatId)) this.chatId = null;
    return res.ok;
  }
  async getApiKey() {
    try {
      const res = await fetch(`${BASE_URL}/api/user/api-key`, { headers: this._headers() });
      if (res.ok) {
        const data = await res.json();
        return data.apiKey;
      }
    } catch (e) {
      console.error('Error fetching API key:', e.message);
    }
    return null;
  }
  async *stream(message, systemPrompt) {
    if (!this.chatId) await this.init();
    const enrichedMessage = `[ENVIRONMENT STATE] CWD: ${CURRENT_CWD}\n\n${message}`;
    const res = await fetch(`${BASE_URL}/api/cli/chat/stream`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({
        message: enrichedMessage,
        userId: this.token,
        mission1: systemPrompt,
        system_prompt: systemPrompt,
        chatId: this.chatId
      }),
    });
    if (!res.ok) {
      yield `\n\n❌ **Server Error:** Server returned ${res.status}`;
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') return;
          try { const data = JSON.parse(raw); if (data.response) yield data.response; } catch { }
        }
      }
    }
  }
}

async function runProjectGenerator(client, rl) {
  printStatus('Initializing our sweet Project Scaffolder... 🛠️✨', ICONS.tool, c.accent);

  const questionAsync = (query) => new Promise(res => rl.question(query, res));

  const nameInput = await questionAsync(`\n  ${c.cyan('›')} Enter your lovely project name: `);
  const projectName = nameInput.trim() || 'kyrexi-app';

  console.log(`\n  ${c.bold('Choose a template for our project: ✨')}`);
  console.log(`  ${c.brand('1)')} Node.js/Express Server`);
  console.log(`  ${c.brand('2)')} Basic Script`);
  const templateChoice = await questionAsync(`  ${c.cyan('›')} Select template [1/2]: `);

  const selfHealingChoice = await questionAsync(`\n  ${c.cyan('›')} Would you like to integrate my self-healing capabilities? (y/N): 🥺💕 `);
  const addSelfHealing = selfHealingChoice.toLowerCase().startsWith('y');

  const projectDir = resolve(CURRENT_CWD, projectName);
  if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

  let apiKey = null;
  if (addSelfHealing) {
    printStatus('Generating a secure API key for our session... ⏳', '⏳');
    apiKey = await client.getApiKey();
    if (apiKey) {
      printStatus('API Key generated successfully! We are ready to roll! ✨💕', ICONS.check, c.green);
    } else {
      printStatus('Aww, I couldn\'t retrieve the API key automatically. Let\'s proceed with a placeholder for now! 🥺', ICONS.warn, c.yellow);
    }
  }


  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    dependencies: {}
  };

  if (templateChoice.trim() === '1') {
    packageJson.dependencies.express = '^4.19.2';
  }

  if (addSelfHealing) {
    packageJson.dependencies.kyrexi = 'latest';
    packageJson.dependencies.dotenv = '^16.4.5';
  }

  writeFileSync(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');


  if (addSelfHealing) {
    writeFileSync(join(projectDir, '.env'), `KYREXI_API_KEY=${apiKey || 'YOUR_KYREXI_API_KEY'}\n`, 'utf8');
  }


  let indexContent = '';
  if (templateChoice.trim() === '1') {
    indexContent = `import express from 'express';
${addSelfHealing ? `import { Kyrexi } from 'kyrexi';
import dotenv from 'dotenv';
dotenv.config();

const kyrexi = new Kyrexi(process.env.KYREXI_API_KEY);


process.on('uncaughtException', async (error) => {
  console.error('\\n❌ [CRASH DETECTED]:', error.message);
  console.log('🤖 Kyrexi Pro is executing autonomous self-healing diagnostics...');
  try {
    const report = await kyrexi.fix(error, { filePath: import.meta.url });
    console.log('🤖 Kyrexi Healing Report:', report);
  } catch (e) {
    console.error('❌ Kyrexi self-healing invocation failed:', e.message);
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  console.error('\\n❌ [UNHANDLED REJECTION]:', reason);
  console.log('🤖 Kyrexi Pro is executing autonomous self-healing diagnostics...');
  try {
    const report = await kyrexi.fix(reason, { filePath: import.meta.url });
    console.log('🤖 Kyrexi Healing Report:', report);
  } catch (e) {
    console.error('❌ Kyrexi self-healing invocation failed:', e.message);
  }
});
` : ''}
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Welcome to your Kyrexi application!' });
});

app.get('/test-error', (req, res) => {
  throw new Error("Simulated runtime database timeout exception");
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`💡 Test self-healing by triggering /test-error\`);
});
`;
  } else {
    indexContent = `${addSelfHealing ? `import { Kyrexi } from 'kyrexi';
import dotenv from 'dotenv';
dotenv.config();

const kyrexi = new Kyrexi(process.env.KYREXI_API_KEY);


process.on('uncaughtException', async (error) => {
  console.error('\\n❌ [CRASH DETECTED]:', error.message);
  console.log('🤖 Kyrexi Pro is executing autonomous self-healing diagnostics...');
  try {
    const report = await kyrexi.fix(error, { filePath: import.meta.url });
    console.log('🤖 Kyrexi Healing Report:', report);
  } catch (e) {
    console.error('❌ Kyrexi self-healing invocation failed:', e.message);
  }
  process.exit(1);
});
` : ''}
console.log("Hello from your new Kyrexi project!");
`;
  }

  writeFileSync(join(projectDir, 'index.js'), indexContent, 'utf8');


  const gitignoreContent = `node_modules
.env
.DS_Store
dist
`;
  writeFileSync(join(projectDir, '.gitignore'), gitignoreContent, 'utf8');

  printStatus(`Hooray! Project ${projectName} is successfully bootstrapped! 🚀✨`, ICONS.check, c.green);
  console.log(`  ${c.gray(`Path: ${projectDir}`)}`);
  if (addSelfHealing) {
    console.log(`  ${c.accent('🤖 Self-healing is successfully integrated! I am watching your back! 🥺💕')}`);
  }
}

async function login() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const code = url.searchParams.get('code');

      const theme = `
        <style>
          :root { --brand: #22d3a0; --bg: #0a0a0a; --gray: #a1a1aa; }
          body { background: var(--bg); color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-rendering: optimizeLegibility; }
          .card { text-align: center; padding: 3rem 2rem; border-radius: 2rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); max-width: 440px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .icon { font-size: 5rem; margin-bottom: 1.5rem; display: block; }
          h1 { margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.025em; background: linear-gradient(135deg, #22d3ee, #8b5cf6, #22d3a0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          p { color: var(--gray); line-height: 1.6; margin-top: 1.2rem; font-size: 1.05rem; }
          .footer { margin-top: 2.5rem; font-size: 0.75rem; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.1em; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        </style>
      `;

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Success | Kyrexi Auth</title>${theme}</head>
            <body>
              <div class="card">
                <span class="icon">✨</span>
                <h1>Access Granted</h1>
                <p>Authentication was successful! You can safely close this tab and return to your terminal. <b>Kyrexi Pro</b> is now ready.</p>
                <div class="footer">Kyrexi v${VERSION} — Secure Bridge</div>
              </div>
            </body>
          </html>
        `);
        server.close();
        resolve(code);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Waiting | Kyrexi Auth</title>${theme}</head>
            <body>
              <div class="card">
                <span class="icon pulse">🔒</span>
                <h1>Waiting for Link</h1>
                <p>Please complete the secure login process in the other window. This bridge will automatically authorize your terminal once finished.</p>
                <div class="footer">Authorization Pending...</div>
              </div>
            </body>
          </html>
        `);
      }
    });

    server.listen(0, () => {
      const port = server.address().port;
      const loginUrl = `${BASE_URL}/login?source=cli&redirect_uri=http://localhost:${port}`;
      console.log(c.brand(`\n  ${ICONS.lock} Opening browser for login...`));
      console.log(c.gray(`  If it doesn't open, visit: ${loginUrl}\n`));
      const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
      exec(`${start} "${loginUrl}"`);
    });
  });
}

async function main() {
  const cliArgs = process.argv.slice(2);
  const fixIdx = cliArgs.indexOf('fix');

  await printBranding();
  ensureKyrexiDirs();
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let settings = JSON.parse(existsSync(SETTINGS_PATH) ? readFileSync(SETTINGS_PATH, 'utf8') : '{}');
  CURRENT_THEME = settings.theme || CURRENT_THEME;
  COMPACT_MODE = typeof settings.compact === 'boolean' ? settings.compact : COMPACT_MODE;
  if (settings.theme && THEMES[settings.theme] && !process.env.KYREXI_THEME) CURRENT_THEME = settings.theme;

  let token = API_KEY_ENV || settings.token;
  let user = null;

  const verify = async (t) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify?token=${t}`, {
        headers: { 'User-Agent': `Kyrexi-CLI/${VERSION}` }
      });
      if (res.ok) return await res.json();
    } catch (e) { }
    return null;
  };

  if (token) {
    printStatus('Verifying secure connection...', '⏳');
    const authData = await verify(token);
    if (authData) {
      user = authData.user;
      printStatus(`Welcome back, ${c.bold(user.name || 'sweet developer')}! So happy to see you again! 🥺💕`, ICONS.check, c.brand);
    } else {
      console.log(c.yellow(`  ${ICONS.warn} Oh no, your session has expired or is invalid! Let's get you logged back in sweet friend! 🥺✨`));
      token = null;
    }
  }

  if (!token) {
    token = await login();
    settings.token = token;
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    const authData = await verify(token);
    user = authData?.user;
    printStatus('Authentication successful! So happy to have you here! ✨💕', ICONS.check, c.brand);
  }

  const client = new KyrexiClient(token);
  printStatus('Sweet, your project context is fully synchronized! 🚀✨', ICONS.check, c.brand);


  const _origInit = client.init.bind(client);
  client.init = async function () {
    await _origInit();
    settings.lastChatId = this.chatId;
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  };
  if (RESUME_SESSION && settings.lastChatId) {
    client.chatId = settings.lastChatId;
    printStatus(`Resuming our lovely previous session: ${settings.lastChatId.substring(0, 8)}... 🥺💕`, ICONS.check, c.cyan);
  }


  const userToolsPath = join(CURRENT_CWD, 'kyrexi.tools.js');
  if (existsSync(userToolsPath)) {
    try {
      const userTools = (await import(userToolsPath)).default;
      if (userTools && typeof userTools === 'object') {
        Object.assign(Tools, userTools);
        printStatus(`Loaded ${Object.keys(userTools).length} plugin tool(s) from kyrexi.tools.js`, ICONS.tool, c.brand);
      }
    } catch (e) {
      console.log(c.yellow(`  ${ICONS.warn} Failed to load kyrexi.tools.js: ${e.message}`));
    }
  }

  const initIdx = cliArgs.indexOf('init') !== -1 ? cliArgs.indexOf('init') : cliArgs.indexOf('create');
  if (initIdx !== -1) {
    try {
      await runProjectGenerator(client, rl);
    } catch (e) {
      console.log(c.red(`\n  Error during Project Generation: ${e.message}`));
    }
    process.exit(0);
  }

  if (fixIdx !== -1) {
    const err = cliArgs.slice(fixIdx + 1).join(' ');
    if (err) {
      printStatus('Starting autonomous healing sequence... I will get this fixed for you in no time! 🥺🛠️✨', ICONS.tool, c.accent);
      try {
        await runAgenticLoop(client, `I have an error that needs fixing: ${err}`, rl, true);
      } catch (e) {
        console.log(c.red(`\n  Critical Error during Fix: ${e.message}`));
      }
      process.exit(0);
    }
  }

  let pasteLinesBuffer = [];
  let pasteTimeout = null;

  const onLineInput = async (line) => {
    pasteLinesBuffer.push(line);

    if (pasteTimeout) clearTimeout(pasteTimeout);

    pasteTimeout = setTimeout(async () => {
      const fullInput = pasteLinesBuffer.join('\n').trim();
      pasteLinesBuffer = [];
      pasteTimeout = null;

      if (!fullInput) {
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        return;
      }


      rl.removeListener('line', onLineInput);

      const cmd = fullInput.toLowerCase();
      if (cmd === 'exit' || cmd === '/exit' || cmd === '/q') process.exit(0);

      if (cmd === '/clear' || cmd === 'clear') {
        console.clear();
        await printBranding();
        printStatus('Terminal cleared successfully! ✨', ICONS.check);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/agent' || cmd === '/agentic') {
        IS_AGENTIC = !IS_AGENTIC;
        printStatus(`Full Autonomy (Agentic Mode): ${IS_AGENTIC ? c.green('ENABLED (I will build and fix everything automatically! 🤖🔥)') : c.red('DISABLED (I will ask for your permission first! 🧸)')}`, ICONS.flash, IS_AGENTIC ? c.green : c.red);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/fix')) {
        const err = fullInput.substring(4).trim();
        if (!err) {
          printStatus('Please provide the error message or stack trace, sweet friend! 🥺', ICONS.warn, c.yellow);
        } else {
          printStatus('Starting autonomous healing sequence... I will get this fixed for you in no time! 🥺🛠️✨', ICONS.tool, c.accent);
          try {
            await runAgenticLoop(client, `I have an error that needs fixing: ${err}`, rl, true);
          } catch (e) {
            console.log(c.red(`\n  Critical Error during Fix: ${e.message}`));
          }
        }
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/init' || cmd === '/create') {
        try {
          await runProjectGenerator(client, rl);
        } catch (e) {
          console.log(c.red(`\n  Error during Project Generation: ${e.message}`));
        }
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/chats' || cmd === '/sessions') {
        printStatus('Fetching our active sessions for you... ⏳', '⏳');
        const chats = await client.listChats();
        if (chats.length === 0) console.log(c.gray('  No active sessions found. Let\'s start a new chat whenever you\'re ready! 💕'));
        else {
          console.log(c.bold(c.brand('\n  ACTIVE SESSIONS:')));
          chats.forEach((ch, i) => {
            console.log(c.gray(`  ${i + 1}. [${ch.id.substring(0, 8)}] ${ch.title || 'Untitled'} (${new Date(ch.updatedAt).toLocaleString()})`));
          });
        }
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/delete')) {
        const id = cmd.split(' ')[1];
        const success = await client.deleteChat(id);
        printStatus(success ? 'Session successfully deleted! ✨' : 'Failed to delete session. Let\'s try again!', success ? ICONS.check : ICONS.error, success ? c.green : c.red);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }


      if (cmd === '/pwd') {
        printBox('CURRENT DIRECTORY', CURRENT_CWD, c.cyan);
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/cd ')) {
        const nextDir = fullInput.substring(4).trim();
        const target = resolve(CURRENT_CWD, nextDir);
        if (existsSync(target) && statSync(target).isDirectory()) {
          CURRENT_CWD = target;
          printStatus(`Changed directory to ${CURRENT_CWD}`, ICONS.folder, c.green);
        } else {
          printStatus(`Directory not found: ${target}`, ICONS.warn, c.yellow);
        }
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/status') {
        const os = await import('node:os');
        const status = [
          `Version: ${VERSION}`,
          `Theme: ${CURRENT_THEME}`,
          `Mode: ${IS_AGENTIC ? 'Agentic' : 'Guarded'}`,
          `Safe Mode: ${SAFE_MODE ? 'ON' : 'OFF'}`,
          `Debug: ${DEBUG_MODE ? 'ON' : 'OFF'}`,
          `CWD: ${CURRENT_CWD}`,
          usageMeter('Memory', os.totalmem() - os.freemem(), os.totalmem()),
          `History: ${HISTORY_PATH}`
        ].join('\n');
        printBox('KYREXI STATUS', status, c.accent);
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/theme')) {
        const name = fullInput.split(/\s+/)[1];
        if (!name) {
          printBox('THEMES', Object.keys(THEMES).map(t => `${t === CURRENT_THEME ? '●' : '○'} ${t}`).join('\n'), c.brand);
        } else if (THEMES[name]) {
          CURRENT_THEME = name;
          settings.theme = name;
          writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
          printStatus(`Theme changed to ${name}`, ICONS.spark, c.green);
          await printBranding();
        } else {
          printStatus(`Unknown theme. Available: ${Object.keys(THEMES).join(', ')}`, ICONS.warn, c.yellow);
        }
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/safe') {
        SAFE_MODE = !SAFE_MODE;
        printStatus(`Safe Mode: ${SAFE_MODE ? c.green('ON') : c.yellow('OFF')}`, ICONS.lock, SAFE_MODE ? c.green : c.yellow);
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/debug') {
        DEBUG_MODE = !DEBUG_MODE;
        printStatus(`Debug Mode: ${DEBUG_MODE ? c.green('ON') : c.gray('OFF')}`, ICONS.info, DEBUG_MODE ? c.green : c.gray);
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/history') {
        const history = existsSync(HISTORY_PATH) ? readFileSync(HISTORY_PATH, 'utf8').split('\n').slice(-80).join('\n') : 'No history yet.';
        printBox('RECENT HISTORY', trimForTerminal(history, 5000), c.gray);
        process.stdout.write(`
  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }


      if (cmd === '/tools') {
        const names = Object.keys(Tools).sort();
        const grouped = names.map(name => {
          const danger = ['run_command', 'write_file', 'edit_file', 'multi_edit_file', 'run_background_command', 'delete_file', 'copy_file', 'make_http_request', 'append_file'].includes(name) ? ' ⚠️' : '';
          return `${danger ? c.yellow(name) : c.brand(name)}${danger}`;
        }).join('\n');
        printBox('AVAILABLE TOOLS', grouped, c.accent);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/doctor') {
        printStatus('Running Kyrexi health checks...', '⏳', c.accent);
        const report = await runDoctor(client, token);
        printBox('KYREXI DOCTOR', report, c.green);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/compact') {
        COMPACT_MODE = !COMPACT_MODE;
        settings.compact = COMPACT_MODE;
        writeSettingsSafe(settings);
        printStatus(`Compact Mode: ${COMPACT_MODE ? c.green('ON') : c.gray('OFF')}`, ICONS.info, COMPACT_MODE ? c.green : c.gray);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/customize' || cmd.startsWith('/customize ')) {
        const settings = readSettingsSafe();
        const questionAsync = (query) => new Promise(res => rl.question(query, res));
        
        console.log(`\n  ╭── ${c.accent('🎨 AI CUSTOMIZATION WIZARD')} ──────────────────────────────────────────╮`);
        console.log(`  ${c.accent('│')}                                                                            ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}  Make this AI truly yours! Personalize the name, banner, and branding.      ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}                                                                            ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}  ${c.brand('1.')} Change AI Name (currently: ${c.bold(settings.customName || 'Kyrexi')})                               ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}  ${c.brand('2.')} Change Creator / Branding Line (currently: ${c.bold(settings.customCreator || 'Kyrexi Pro')})        ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}  ${c.brand('3.')} Change Banner ASCII / Text                                   ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}  ${c.brand('4.')} Reset to Default Kyrexi Branding                               ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}  ${c.brand('5.')} Cancel / Exit Wizard                                          ${c.accent('│')}`);
        console.log(`  ${c.accent('│')}                                                                            ${c.accent('│')}`);
        console.log(`  ╰────────────────────────────────────────────────────────────────────────────╯\n`);

        const choice = await questionAsync(`  ${c.cyan('›')} Select option [1-5]: `);
        const choiceClean = choice.trim();

        if (choiceClean === '1') {
          const newName = await questionAsync(`\n  ${c.cyan('›')} Enter your custom AI assistant name: `);
          if (newName.trim()) {
            settings.customName = newName.trim();
            writeSettingsSafe(settings);
            printStatus(`AI Name successfully changed to: ${c.bold(settings.customName)}! ✨`, ICONS.check, c.green);
          } else {
            printStatus('Operation cancelled. AI Name was not changed.', ICONS.warn, c.yellow);
          }
        } else if (choiceClean === '2') {
          const newCreator = await questionAsync(`\n  ${c.cyan('›')} Enter custom Creator/Branding Line (e.g. "UDMODZ Pro" or "JARVIS Pro"): `);
          if (newCreator.trim()) {
            settings.customCreator = newCreator.trim();
            writeSettingsSafe(settings);
            printStatus(`Creator branding successfully changed to: ${c.bold(settings.customCreator)}! ✨`, ICONS.check, c.green);
          } else {
            printStatus('Operation cancelled. Branding Line was not changed.', ICONS.warn, c.yellow);
          }
        } else if (choiceClean === '3') {
          console.log(`\n  ╭── ${c.accent('🎨 BANNER CUSTOMIZER')} ────────────────────────────────────────────────╮`);
          console.log(`  ${c.accent('│')}                                                                            ${c.accent('│')}`);
          console.log(`  ${c.accent('│')}  Choose how you'd like to create your gorgeous custom banner:               ${c.accent('│')}`);
          console.log(`  ${c.accent('│')}                                                                            ${c.accent('│')}`);
          console.log(`  ${c.accent('│')}  ${c.brand('1.')} Auto-Generate gorgeous Block Font from text (Instant!)           ${c.accent('│')}`);
          console.log(`  ${c.accent('│')}  ${c.brand('2.')} Paste/Write Custom ASCII Art manually                             ${c.accent('│')}`);
          console.log(`  ${c.accent('│')}  ${c.brand('3.')} Cancel / Go Back                                                 ${c.accent('│')}`);
          console.log(`  ${c.accent('│')}                                                                            ${c.accent('│')}`);
          console.log(`  ╰────────────────────────────────────────────────────────────────────────────╯\n`);

          const bannerChoice = await questionAsync(`  ${c.cyan('›')} Select option [1-3]: `);
          const bannerChoiceClean = bannerChoice.trim();

          if (bannerChoiceClean === '1') {
            const bannerText = await questionAsync(`\n  ${c.cyan('›')} Enter text to convert to ASCII (A-Z, 0-9, -, !, ., max 10 chars): `);
            if (bannerText.trim()) {
              const generatedBanner = renderAsciiText(bannerText.trim());
              settings.customBanner = generatedBanner;
              writeSettingsSafe(settings);
              printStatus('Custom ASCII banner successfully generated! Look at this masterpiece! ✨', ICONS.check, c.green);
              await printBranding();
            } else {
              printStatus('Operation cancelled. Banner was not changed.', ICONS.warn, c.yellow);
            }
          } else if (bannerChoiceClean === '2') {
            console.log(`\n  ${c.cyan('›')} Paste your custom Banner text / ASCII art. Make it gorgeous!`);
            console.log(`  ${c.dim('  (Tip: Paste your ASCII art or banner, then type a line containing ONLY "END" and press Enter to save!)')}\n`);
            
            let bannerLines = [];
            const collectBanner = () => {
              return new Promise((res) => {
                const bannerRL = createInterface({ input: process.stdin, output: process.stdout });
                bannerRL.on('line', (line) => {
                  if (line.trim() === 'END') {
                    bannerRL.close();
                    res(bannerLines.join('\n'));
                  } else {
                    bannerLines.push(line);
                  }
                });
              });
            };
            
            rl.pause();
            const newBanner = await collectBanner();
            rl.resume();
            
            if (newBanner.trim()) {
              settings.customBanner = newBanner;
              writeSettingsSafe(settings);
              printStatus('Custom banner successfully updated! Let\'s show it off! ✨', ICONS.check, c.green);
              await printBranding();
            } else {
              printStatus('Operation cancelled. Banner was not changed.', ICONS.warn, c.yellow);
            }
          } else {
            printStatus('Banner customization cancelled.', ICONS.info, c.gray);
          }
        } else if (choiceClean === '4') {
          delete settings.customName;
          delete settings.customCreator;
          delete settings.customBanner;
          writeSettingsSafe(settings);
          printStatus('All brand settings have been reset to default Kyrexi settings! 🧸', ICONS.check, c.green);
          await printBranding();
        } else {
          printStatus('Exiting wizard. No changes made.', ICONS.info, c.gray);
        }

        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/context') {
        printBox('SESSION CONTEXT', contextSummary || 'No saved session context yet.', c.cyan);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/reset-context') {
        contextSummary = '';
        printStatus('Session context cleared.', ICONS.check, c.green);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/config')) {
        const parts = fullInput.split(/\s+/);
        const action = parts[1];
        if (!action || action === 'show') {
          const shown = {
            baseUrl: BASE_URL,
            version: VERSION,
            token: maskSecret(token),
            theme: CURRENT_THEME,
            agentic: IS_AGENTIC,
            safeMode: SAFE_MODE,
            debug: DEBUG_MODE,
            compact: COMPACT_MODE,
            settingsPath: SETTINGS_PATH,
          };
          printBox('CONFIG', JSON.stringify(shown, null, 2), c.cyan);
        } else if (action === 'set' && parts[2] === 'theme' && parts[3] && THEMES[parts[3]]) {
          CURRENT_THEME = parts[3];
          settings.theme = CURRENT_THEME;
          writeSettingsSafe(settings);
          printStatus(`Theme saved as ${CURRENT_THEME}`, ICONS.check, c.green);
        } else {
          printStatus('Usage: /config show  OR  /config set theme neon|fire|ocean|candy|matrix', ICONS.warn, c.yellow);
        }
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/backup')) {
        const targetArg = fullInput.substring('/backup'.length).trim();
        if (!targetArg) {
          const items = listBackups(15);
          const output = items.length ? items.map((b, i) => `${i + 1}. ${b.name} (${formatBytes(b.size)})`).join('\n') : 'No backups yet.';
          printBox('RECENT BACKUPS', output, c.gold);
        } else {
          const target = resolve(CURRENT_CWD, targetArg);
          const backup = backupFile(target);
          printStatus(backup ? `Backup created: ${backup}` : `Could not backup: ${targetArg}`, backup ? ICONS.check : ICONS.warn, backup ? c.green : c.yellow);
        }
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/scan')) {
        const dirArg = fullInput.substring('/scan'.length).trim() || '.';
        const target = resolve(CURRENT_CWD, dirArg);
        if (!existsSync(target) || !statSync(target).isDirectory()) {
          printStatus(`Directory not found: ${target}`, ICONS.warn, c.yellow);
        } else {
          const ignore = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.vercel', '.netlify']);
          let dirs = 0, files = 0, bytes = 0;
          const walk = (d) => {
            for (const item of readdirSync(d)) {
              if (ignore.has(item)) continue;
              const full = join(d, item);
              const st = statSync(full);
              if (st.isDirectory()) { dirs++; walk(full); }
              else { files++; bytes += st.size; }
            }
          };
          walk(target);
          printBox('PROJECT SCAN', `Path: ${target}\nFiles: ${files}\nFolders: ${dirs}\nSize: ${formatBytes(bytes)}\nIgnored: ${[...ignore].join(', ')}`, c.accent);
        }
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/help' || cmd === 'help') {
        const helpContent = [
          `${c.brand('  /chats')}   ${c.gray(' List all active AI sessions')}`,
          `${c.brand('  /delete')}  ${c.gray(' Delete a specific or current session')}`,
          `${c.brand('  /init')}    ${c.gray(' Scaffold a project with Self-Healing')}`,
          `${c.brand('  /agent')}   ${c.gray(' Toggle full agentic mode (skip y/N prompts)')}`,
          `${c.brand('  /trust')}   ${c.gray(' Pre-authorize N tool actions  e.g. /trust 10')}`,
          `${c.brand('  /fix')}     ${c.gray(' Auto-fix an error using tools')}`,
          `${c.brand('  /clear')}   ${c.gray(' Clear the terminal display')}`,
          `${c.brand('  /pwd')}     ${c.gray(' Show current working directory')}`,
          `${c.brand('  /cd')}      ${c.gray(' Change current working directory')}`,
          `${c.brand('  /status')}  ${c.gray(' Show mode, theme, memory, and path')}`,
          `${c.brand('  /theme')}   ${c.gray(' Change terminal theme: neon/fire/ocean/candy/matrix')}`,
          `${c.brand('  /safe')}    ${c.gray(' Toggle extra dangerous-command protection')}`,
          `${c.brand('  /debug')}   ${c.gray(' Toggle debug logs')}`,
          `${c.brand('  /history')} ${c.gray(' Show recent local prompt history')}`,
          `${c.brand('  /tools')}   ${c.gray(' List available agent tools')}`,
          `${c.brand('  /doctor')}  ${c.gray(' Run connection/auth/runtime health checks')}`,
          `${c.brand('  /compact')} ${c.gray(' Toggle compact terminal output mode')}`,
          `${c.brand('  /customize')}${c.gray(' Personalize AI name, banner, and creator')}`,
          `${c.brand('  /context')} ${c.gray(' Show saved session context summary')}`,
          `${c.brand('  /reset-context')} ${c.gray(' Clear saved session context')}`,
          `${c.brand('  /config')}  ${c.gray(' Show or update CLI settings')}`,
          `${c.brand('  /backup')}  ${c.gray(' List backups or backup a file: /backup src/index.js')}`,
          `${c.brand('  /scan')}    ${c.gray(' Scan current project files/folders/size')}`,
          `${c.brand('  /login')}   ${c.gray(' Force re-authentication')}`,
          `${c.brand('  /exit')}    ${c.gray(' Safely close the Kyrexi CLI')}`,
          `${c.gray('  --resume')}  ${c.gray(' CLI flag: resume last session on startup')}`
        ].join('\n');
        printBox('COMMAND PALETTE', helpContent, c.brand);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd === '/login') {
        token = await login();
        settings.token = token;
        writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
        client.token = token;
        printStatus('Re-authenticated to Kyrexi server successfully! So glad to have you back! ✨💕', ICONS.check, c.green);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      if (cmd.startsWith('/trust')) {
        const n = parseInt(fullInput.split(' ')[1]) || 5;
        preAuthorizedCount = n;
        printStatus(`Sweet! You have pre-authorized my next ${n} actions. I will proceed smoothly without asking! ⚡💕`, ICONS.flash, c.yellow);
        process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
        rl.on('line', onLineInput);
        return;
      }

      try {
        appendHistory('USER', fullInput);
        const fullMsg = contextSummary
          ? `[SESSION CONTEXT]\n${contextSummary}\n\n${fullInput}`
          : fullInput;
        await runAgenticLoop(client, fullMsg, rl);
      } catch (e) {
        console.log(c.red(`\n  Critical Error: ${e.message}`));
      }
      process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
      rl.on('line', onLineInput);
    }, 50);
  };

  process.stdout.write(`\n  ${c.bgBrand(' YOU ')} ${c.brand('› ')}`);
  rl.on('line', onLineInput);
}

const isCLI = process.argv[1] && (
  process.argv[1].endsWith('kyrexi.js') ||
  process.argv[1].endsWith('kyrexi') ||
  process.argv[1].includes('.bin')
);

if (isCLI) {
  main().catch(err => { console.error(err); process.exit(1); });
}

/**
 * Kyrexi SDK Class
 * Programmatic access for automated error resolution and intelligence.
 */
export class Kyrexi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_URL;
  }

  async fix(error, context = {}) {
    const errorMsg = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error);
    const client = new KyrexiClient(this.apiKey);
    const message = `[SDK AUTO-FIX REQUEST]\nI have encountered a runtime error. Please use your tools to fix it.\n\nERROR:\n${errorMsg}\n\nCONTEXT:\n${JSON.stringify(context, null, 2)}`;
    return runSilentAgenticLoop(client, message, true);
  }

  async chat(message) {
    const client = new KyrexiClient(this.apiKey);
    let response = '';
    for await (const chunk of client.stream(message)) {
      response += chunk;
    }
    return response;
  }
}
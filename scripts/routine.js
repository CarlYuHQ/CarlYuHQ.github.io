#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ROUTINE_PATH = path.join(ROOT, "_data", "routine.yml");

function pad(n) {
  return String(n).padStart(2, "0");
}

function todayKey(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseRoutine(text) {
  const data = { tasks: [], meta: { leetcode_streak: 0 }, log: {} };
  const lines = text.split(/\r?\n/);
  let section = null;
  let currentDate = null;
  let currentTask = null;
  let indent = 0;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    if (/^tasks:\s*$/.test(line)) {
      section = "tasks";
      continue;
    }
    if (/^meta:\s*$/.test(line)) {
      section = "meta";
      continue;
    }
    if (/^log:\s*$/.test(line)) {
      section = "log";
      continue;
    }

    if (section === "tasks") {
      const m = line.match(/^\s*-\s+id:\s*(.+)$/);
      if (m) {
        currentTask = { id: m[1].trim().replace(/^["']|["']$/g, "") };
        data.tasks.push(currentTask);
        continue;
      }
      const label = line.match(/^\s+label:\s*(.+)$/);
      if (label && currentTask) {
        currentTask.label = label[1].trim().replace(/^["']|["']$/g, "");
        continue;
      }
      const emoji = line.match(/^\s+emoji:\s*(.+)$/);
      if (emoji && currentTask) {
        currentTask.emoji = emoji[1].trim().replace(/^["']|["']$/g, "");
      }
      continue;
    }

    if (section === "meta") {
      const streak = line.match(/^\s+leetcode_streak:\s*(\d+)/);
      if (streak) {
        data.meta.leetcode_streak = parseInt(streak[1], 10) || 0;
      }
      continue;
    }

    if (section === "log") {
      const dateLine = line.match(/^\s*"(\d{4}-\d{2}-\d{2})":\s*$/);
      if (dateLine) {
        currentDate = dateLine[1];
        data.log[currentDate] = data.log[currentDate] || {};
        continue;
      }
      const taskLine = line.match(/^\s+(\w+):\s*\{\s*done:\s*(true|false)(?:,\s*count:\s*(\d+))?\s*\}/);
      if (taskLine && currentDate) {
        const entry = { done: taskLine[2] === "true" };
        if (taskLine[3]) entry.count = parseInt(taskLine[3], 10);
        data.log[currentDate][taskLine[1]] = entry;
      }
    }
  }

  return data;
}

function serializeRoutine(data) {
  const out = [];
  out.push("tasks:");
  for (const task of data.tasks) {
    out.push(`  - id: ${task.id}`);
    out.push(`    label: ${task.label}`);
    out.push(`    emoji: "${task.emoji || ""}"`);
  }
  out.push("");
  out.push("meta:");
  out.push(`  leetcode_streak: ${data.meta.leetcode_streak || 0}`);
  out.push("");
  out.push("log:");
  const dates = Object.keys(data.log || {}).sort();
  for (const date of dates) {
    out.push(`  "${date}":`);
    const day = data.log[date];
    for (const id of Object.keys(day)) {
      const item = day[id];
      if (item.count != null) {
        out.push(`    ${id}: { done: ${item.done}, count: ${item.count} }`);
      } else {
        out.push(`    ${id}: { done: ${item.done} }`);
      }
    }
  }
  out.push("");
  return out.join("\n");
}

function computeLeetcodeStreak(log) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = todayKey(d);
    const entry = log[key] && log[key].leetcode;
    if (entry && entry.done) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function loadRoutine() {
  const text = fs.readFileSync(ROUTINE_PATH, "utf8");
  return parseRoutine(text);
}

function saveRoutine(data) {
  data.meta.leetcode_streak = computeLeetcodeStreak(data.log || {});
  fs.writeFileSync(ROUTINE_PATH, serializeRoutine(data), "utf8");
}

function printStatus(data, dateKey) {
  data.meta.leetcode_streak = computeLeetcodeStreak(data.log || {});
  const day = (data.log && data.log[dateKey]) || {};
  console.log(`Routine for ${dateKey}`);
  console.log(`LeetCode streak: ${data.meta.leetcode_streak || 0} days`);
  for (const task of data.tasks) {
    const entry = day[task.id] || { done: false };
    const mark = entry.done ? "done" : "pending";
    const extra = entry.count != null ? ` (+${entry.count})` : "";
    console.log(`  ${task.emoji || ""} ${task.label}: ${mark}${extra}`);
  }
}

function usage() {
  console.log(`Usage:
  npm run routine -- status [YYYY-MM-DD]
  npm run routine -- <taskId> done [count]
  npm run routine -- <taskId> undo`);
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    usage();
    process.exit(1);
  }

  const data = loadRoutine();
  const taskIds = new Set(data.tasks.map((t) => t.id));

  if (args[0] === "status") {
    const dateKey = args[1] || todayKey();
    printStatus(data, dateKey);
    saveRoutine(data);
    return;
  }

  const taskId = args[0];
  const action = args[1];
  if (!taskIds.has(taskId) || !action) {
    usage();
    process.exit(1);
  }

  const dateKey = todayKey();
  data.log[dateKey] = data.log[dateKey] || {};

  if (action === "done") {
    const entry = { done: true };
    const count = parseInt(args[2], 10);
    if (!Number.isNaN(count) && count > 0) {
      entry.count = count;
    } else if (data.log[dateKey][taskId] && data.log[dateKey][taskId].count) {
      entry.count = data.log[dateKey][taskId].count;
    }
    data.log[dateKey][taskId] = entry;
  } else if (action === "undo") {
    data.log[dateKey][taskId] = { done: false };
  } else {
    usage();
    process.exit(1);
  }

  saveRoutine(data);
  printStatus(data, dateKey);
  console.log("\nNext: git add _data/routine.yml && git commit -m \"routine: update\" && git push");
}

main();

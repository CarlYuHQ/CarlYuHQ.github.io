#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const FEED_URL = "https://carlyuhq.github.io/Blogs/atom.xml";
const HEXO_OUT = path.join(ROOT, "_data", "hexo_latest.json");
const SITE_UPDATES = path.join(ROOT, "_data", "site_updates.yml");
const MERGED_OUT = path.join(ROOT, "_data", "latest_updates.json");
const LIMIT = 8;
const DISPLAY_LIMIT = 10;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchText(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

function decodeXml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html) {
  let t = decodeXml(html);
  t = t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
  return t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseAtom(xml) {
  const entries = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = re.exec(xml))) {
    const block = match[1];
    const title = decodeXml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || "").trim();
    const link = ((block.match(/<link[^>]*href="([^"]+)"/) || [])[1] || "").trim();
    const updated = ((block.match(/<updated>([\s\S]*?)<\/updated>/) || [])[1] || "").trim();
    const published = ((block.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || updated).trim();
    const summaryRaw = (block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || "";
    if (!title || !link) continue;
    const excerpt = stripHtml(summaryRaw).slice(0, 80);
    entries.push({
      date: (published || updated).slice(0, 10),
      title,
      url: link,
      source: "hexo",
      type: "blog",
      label: `更新了博客「${title}」`,
      ...(excerpt ? { excerpt } : {}),
    });
  }
  return entries.slice(0, LIMIT);
}

function parseSiteUpdates(text) {
  const items = [];
  const blocks = text.split(/^-\s+date:/m).slice(1);
  for (const block of blocks) {
    const date = block.match(/^\s*(\d{4}-\d{2}-\d{2})/);
    const type = block.match(/^\s*type:\s*(\S+)/m);
    const title = block.match(/^\s*title:\s*(.+)$/m);
    const url = block.match(/^\s*url:\s*(.+)$/m);
    const source = block.match(/^\s*source:\s*(\S+)/m);
    if (!date || !title) continue;
    items.push({
      date: date[1],
      type: (type && type[1]) || "site",
      title: title[1].trim(),
      url: (url && url[1].trim()) || "/",
      source: (source && source[1]) || "site",
      label: title[1].trim(),
    });
  }
  return items;
}

function mergeUpdates(hexoItems, siteItems) {
  const seen = new Set();
  const merged = [];
  for (const item of [...siteItems, ...hexoItems]) {
    const key = `${item.url}|${item.date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  merged.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return merged.slice(0, DISPLAY_LIMIT);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  const strict = process.env.STRICT_FEED === "1" || process.argv.includes("--strict");
  let hexoItems = [];
  let cachedItems = [];
  if (fs.existsSync(HEXO_OUT)) {
    try {
      cachedItems = JSON.parse(fs.readFileSync(HEXO_OUT, "utf8"));
      hexoItems = cachedItems;
    } catch (err) {
      cachedItems = [];
      hexoItems = [];
    }
  }

  let feedOk = false;
  try {
    const xml = await fetchText(FEED_URL);
    hexoItems = parseAtom(xml);
    writeJson(HEXO_OUT, hexoItems);
    feedOk = true;
    console.log(`Synced ${hexoItems.length} entries from Hexo feed.`);
  } catch (err) {
    console.warn(`Feed sync failed: ${err.message}`);
    if (cachedItems.length) {
      console.warn("Using existing hexo_latest.json.");
      hexoItems = cachedItems;
    } else if (strict) {
      console.error("STRICT_FEED: no feed and no cache.");
      process.exit(1);
    }
  }

  if (strict && !feedOk) {
    process.exit(1);
  }

  let siteItems = [];
  if (fs.existsSync(SITE_UPDATES)) {
    siteItems = parseSiteUpdates(fs.readFileSync(SITE_UPDATES, "utf8"));
  }

  const merged = mergeUpdates(hexoItems, siteItems);
  writeJson(MERGED_OUT, merged);
  console.log(`Merged ${merged.length} updates into latest_updates.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

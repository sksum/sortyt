import { parseDuration, buildOrder } from "./sortlib.js";

const WATCH_PATTERNS = [
  "https://www.youtube.com/watch*",
  "https://m.youtube.com/watch*",
];

async function getDuration(tabId) {
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const v = document.querySelector("video");
        if (v && Number.isFinite(v.duration) && v.duration > 0) return { secs: v.duration };
        return { text: document.querySelector(".ytp-time-duration")?.textContent ?? null };
      },
    });
    return res.result.secs ?? parseDuration(res.result.text);
  } catch {
    return Infinity; // discarded/unloaded tab, or injection failed
  }
}

chrome.action.onClicked.addListener(async (clicked) => {
  const yts = await chrome.tabs.query({ windowId: clicked.windowId, url: WATCH_PATTERNS });
  const durations = await Promise.all(yts.map((t) => getDuration(t.id)));
  const ytIds = buildOrder(yts.map((t, i) => ({ id: t.id, duration: durations[i] })));
  const all = await chrome.tabs.query({ windowId: clicked.windowId });
  const otherIds = all.map((t) => t.id).filter((id) => !ytIds.includes(id));

  let index = 0;
  for (const id of [...ytIds, ...otherIds]) {
    try {
      await chrome.tabs.move(id, { index: index++ });
    } catch {
      // pinned tab can't cross the pinned/unpinned boundary — leave it in place
    }
  }

  chrome.action.setBadgeText({ tabId: clicked.id, text: "✓" });
  setTimeout(() => chrome.action.setBadgeText({ tabId: clicked.id, text: "" }), 1500);
});

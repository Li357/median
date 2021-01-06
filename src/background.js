/* global chrome, browser */

const api = typeof chrome !== 'undefined' ? chrome : browser;
api.webNavigation.onHistoryStateUpdated.addListener(
  ({ tabId }) => {
    api.tabs.executeScript(tabId, { file: '/utils.js' });
    api.tabs.executeScript(tabId, { file: '/injector.js' });
  },
  {
    url: [{ urlMatches: 'https://medium.com/p/.*/edit' }, { urlMatches: 'https://medium.com/new-story' }],
  },
);

api.runtime.onMessage.addListener(({ type, ...options }, sender, sendResponse) => {
  if (type === 'getTypesetImageUri') {
    getTypesetImageUri(options).then(sendResponse);
  } else if (type === 'getTypesetImageBase64') {
    getTypesetImageBase64(options).then(sendResponse);
  }
  return true;
});

const QUICKLATEX_BASE = 'https://quicklatex.com';
const QUICKLATEX_API = `${QUICKLATEX_BASE}/latex3.f`;

async function getTypesetImageUri({ preamble, math, fontSize, fontColor }) {
  const response = await fetch(QUICKLATEX_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-urlencoded' },
    body: `preamble=${preamble}&formula=${encodeURIComponent(math)}&fsize=${`${fontSize}px`}&fcolor=${fontColor}&out=1`,
  });
  const text = await response.text();
  // QuickLaTeX's response looks like this:
  // <integer>\n
  // <uri> <integer> <width> <height>
  const secondLine = text.split('\n')[1];
  const [uri] = secondLine.split(' ');
  // we send back ONLY the latter section of the uri, i.e. /cache3/….png
  // since we don't want unfiltered fetches allowed when the 'getTypesetImageBase64' message is sent
  const imagePath = uri.slice(QUICKLATEX_BASE.length);
  console.log(imagePath);
  return imagePath;
}

function getTypesetImageBase64({ imagePath }) {
  // fetches png as blob --> base64 (serializable)
  return new Promise((resolve, reject) => {
    fetch(`${QUICKLATEX_BASE}${imagePath}`)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.addEventListener('loadend', () => {
          resolve(reader.result);
        });
        reader.addEventListener('error', () => {
          reject(reader.error);
        });
      });
  });
}

/* global chrome, browser */
/* exported createMathImage, createMathImageFile, placeFileIntoPost */

const LATEX_USEPACKAGE_STATEMENT = /(\\usepackage.+)/g;

function sendMessage(message) {
  const isChrome = typeof chrome !== 'undefined';
  if (isChrome) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (response) {
          return resolve(response);
        }
        reject(chrome.runtime.lastError);
      });
    });
  }
  return browser.runtime.sendMessage(message);
}

async function createMathImage(rawMath, fontSize, fontColor) {
  const preambleStatements = rawMath.match(LATEX_USEPACKAGE_STATEMENT);
  const preamble = preambleStatements !== null ? preambleStatements.join('\n') : '';
  const math = rawMath.replace(LATEX_USEPACKAGE_STATEMENT, '');

  const imagePath = await sendMessage({ type: 'getTypesetImageUri', preamble, math, fontSize, fontColor });
  return imagePath;
}

async function createMathImageFile(imagePath) {
  const base64 = await sendMessage({ type: 'getTypesetImageBase64', imagePath });
  const response = await fetch(base64); // convert base64 to blob
  const blob = await response.blob();
  const fileName = imagePath.slice(imagePath.lastIndexOf('/') + 1);
  return new File([blob], fileName, { type: 'image/png' });
}

function placeFileIntoPost(file, x, y) {
  let dataTransfer = new DataTransfer();
  if ('wrappedJSObject' in window) {
    // Handles Firefox Xray vision, see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
    dataTransfer = new window.wrappedJSObject.DataTransfer();
  }

  dataTransfer.items.add(file);
  const event = new DragEvent('drop', {
    clientX: x,
    clientY: y,
    dataTransfer,
  });
  document.body.dispatchEvent(event);
}

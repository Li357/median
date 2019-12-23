const LATEX_USEPACKAGE_STATEMENT = /(\\usepackage.+)/g;

/* exported createMathImage, createMathImageFile, placeFileIntoPost */

const QUICKLATEX_API = 'https://quicklatex.com/latex3.f';

async function createMathImage(rawMath, fontSize, fontColor) {
  const preambleStatements = rawMath.match(LATEX_USEPACKAGE_STATEMENT);
  const preamble = preambleStatements !== null ? preambleStatements.join('\n') : '';
  const math = rawMath.replace(LATEX_USEPACKAGE_STATEMENT, '');

  const response = await fetch(QUICKLATEX_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-urlencoded' },
    body: `preamble=${preamble}&formula=${encodeURIComponent(math)}&fsize=${`${fontSize}px`}&fcolor=${fontColor}`,
  });
  const text = await response.text();
  const secondLine = text.split('\n')[1];
  const [uri] = secondLine.split(' ');
  return uri;
}

async function createMathImageFile(imageUri) {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const fileName = imageUri.slice(imageUri.lastIndexOf('/') + 1);
  return new File([blob], fileName, { type: 'image/gif' });
}

function placeFileIntoPost(file, x, y) {
  let dataTransfer = new DataTransfer();
  if ('wrappedJSObject' in window) { // Handles Firefox Xray vision, see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
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

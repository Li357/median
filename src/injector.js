const HIGHLIGHTMENU_TEXT = '.highlightMenu:last-child';
const HIGHLIGHTMENU_TEXT_BUTTONS_CONTAINER = `${HIGHLIGHTMENU_TEXT} > .highlightMenu-inner > .buttonSet`;
const HIGHLIGHTMENU_TEXT_ACTIVE_CLASS = 'highlightMenu--active';
const HIGHLIGHTMENU_TEXT_DIVIDER = `${HIGHLIGHTMENU_TEXT_BUTTONS_CONTAINER} > .buttonSet-separator`;
const HIGHLIGHTMENU_BUTTON = `${HIGHLIGHTMENU_TEXT_BUTTONS_CONTAINER} > .button--highlightMenu`;

const SIGMA_PATH = 'M3.63,2.05v.56l6.53,8.08L3.63,18.52V19l12.75-.08c.16-1.62.48-3.23.73-4.76l-.41-.08a5.73,5.73,0,0,1-1.45,2.42,5.31,5.31,0,0,1-3.15.56H6.21l6-7.26L6.77,3.1H9.92c2,0,4.85-.49,5.65,1.94a3.33,3.33,0,0,1,.24,1.29h.49L16,2.13H3.63Z';

async function injectMath(rawMath, fontSize, fontColor, x, y) {
  const uri = await createMathImage(rawMath, fontSize, fontColor);
  const file = await createMathImageFile(uri);
  placeFileIntoPost(file, x, y);
}

function injectMedian() {
  const median = document.querySelector(HIGHLIGHTMENU_BUTTON).cloneNode(true);
  median.dataset.action = 'math';
  median.querySelector('span').classList.replace('svgIcon--bold', 'svgIcon--math');
  median.querySelector('svg > path').setAttribute('d', SIGMA_PATH);
  median.addEventListener('click', async () => {
    const selection = window.getSelection();
    const selectionText = selection.toString();
    const { x, y } = selection.getRangeAt(0).getBoundingClientRect();
    await injectMath(selectionText, 30, '000000', x, y);
    selection.deleteFromDocument();
  });

  const divider = document.querySelector(HIGHLIGHTMENU_TEXT_DIVIDER).cloneNode(true);
  const buttonsContainer = document.querySelector(HIGHLIGHTMENU_TEXT_BUTTONS_CONTAINER);
  buttonsContainer.appendChild(divider);
  buttonsContainer.appendChild(median);
}

setTimeout(() => {
  injectMedian();

  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.target.classList.contains(HIGHLIGHTMENU_TEXT_ACTIVE_CLASS)) {
        injectMedian();
      }
    });
  });
  observer.observe(document.querySelector(HIGHLIGHTMENU_TEXT), { childList: true });
}, 1000);

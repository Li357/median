/* global createMathImage, createMathImageFile, placeFileIntoPost, deleteSelection */

const HIGHLIGHTMENU_CLASS = 'highlightMenu';
const HIGHLIGHTMENU_ACTIVE_CLASS = `${HIGHLIGHTMENU_CLASS}--active`;

const HIGHLIGHTMENU_TEXT = `.${HIGHLIGHTMENU_CLASS}:last-child`;
const HIGHLIGHTMENU_MEDIA = `.${HIGHLIGHTMENU_CLASS}`;

const HIGHLIGHTMENU_BUTTONS_CONTAINER = `.${HIGHLIGHTMENU_CLASS}-inner > .buttonSet`;
const HIGHLIGHTMENU_DIVIDER = `${HIGHLIGHTMENU_BUTTONS_CONTAINER} > .buttonSet-separator`;
const HIGHLIGHTMENU_BUTTON = `${HIGHLIGHTMENU_BUTTONS_CONTAINER} > .button--highlightMenu[data-action=link]`; // Link icon has no state
const HIGHLIGHTMENU_BUTTON_SIZE = 21;

const MATH_SIZE_MIN = 20;
const MATH_SIZE_MAX = 90;
const MATH_SIZE_DEFAULT = 30;

const SIGMA_PATH = 'M3.63,2.05v.56l6.53,8.08L3.63,18.52V19l12.75-.08c.16-1.62.48-3.23.73-4.76l-.41-.08a5.73,5.73,0,0,1-1.45,2.42,5.31,5.31,0,0,1-3.15.56H6.21l6-7.26L6.77,3.1H9.92c2,0,4.85-.49,5.65,1.94a3.33,3.33,0,0,1,.24,1.29h.49L16,2.13H3.63Z';
const TEXT_PATH = 'M3 2v4.747h1.656l.383-2.568.384-.311h3.88V15.82l-.408.38-1.56.12V18h7.174v-1.68l-1.56-.12-.407-.38V3.868h3.879l.36.311.407 2.568h1.656V2z';

function createHighlightMenuButton(type, size, iconPath) {
  const button = document.querySelector(HIGHLIGHTMENU_BUTTON).cloneNode(true);
  button.dataset.action = 'type';
  button.disabled = false;
  button.querySelector('span').classList.add(`svgIcon--${type}`, `svgIcon--${size}px`);
  button.querySelector('svg > path').setAttribute('d', iconPath);
  return button;
}

async function injectMath(rawMath, fontSize, fontColor, x, y) {
  const uri = await createMathImage(rawMath, fontSize, fontColor);
  const file = await createMathImageFile(uri);
  placeFileIntoPost(file, x, y);
}

function injectMedian(textHighlightMenu) {
  const median = createHighlightMenuButton('math', HIGHLIGHTMENU_BUTTON_SIZE, SIGMA_PATH);
  median.addEventListener('click', async () => {
    const selection = window.getSelection();
    const selectionText = selection.toString();
    const { x, y } = selection.getRangeAt(0).getBoundingClientRect();
    await injectMath(selectionText, 30, '000000', x, y);
    deleteSelection();
  });

  const divider = textHighlightMenu.querySelector(HIGHLIGHTMENU_DIVIDER).cloneNode(true);
  const buttonsContainer = textHighlightMenu.querySelector(HIGHLIGHTMENU_BUTTONS_CONTAINER);
  buttonsContainer.appendChild(divider);
  buttonsContainer.appendChild(median);
}

function injectImageOptions(mediaHighlightMenu) {
  const backToText = createHighlightMenuButton('back-to-text', HIGHLIGHTMENU_BUTTON_SIZE, TEXT_PATH);
  backToText.addEventListener('click', () => {
    // TODO
  });

  const fontSizeContainer = document.createElement('span');
  fontSizeContainer.classList.add('button', 'button--highlightMenu');

  const fontSizeLabel = document.createElement('span');
  fontSizeLabel.classList.add('button-label', 'js-buttonLabel', 'median-font-size-label');
  fontSizeLabel.innerText = 'Font Size: ';

  const fontSizeInput = document.createElement('input');
  fontSizeInput.type = 'range';
  fontSizeInput.min = MATH_SIZE_MIN;
  fontSizeInput.max = MATH_SIZE_MAX;
  fontSizeInput.value = MATH_SIZE_DEFAULT; // TODO: storage

  const fontSizeIndicator = document.createElement('span');
  fontSizeIndicator.classList.add('button-label', 'js-buttonLabel', 'median-font-size-label-last');
  fontSizeIndicator.innerText = `${fontSizeInput.value}px`;
  fontSizeInput.addEventListener('input', (event) => {
    fontSizeIndicator.innerText = `${event.target.value}px`;
  });
  fontSizeInput.addEventListener('change', () => {
    // TODO
  });

  fontSizeContainer.appendChild(fontSizeLabel);
  fontSizeContainer.appendChild(fontSizeInput);
  fontSizeContainer.appendChild(fontSizeIndicator);

  const divider = mediaHighlightMenu.querySelector(HIGHLIGHTMENU_DIVIDER).cloneNode(true);
  const buttonsContainer = mediaHighlightMenu.querySelector(HIGHLIGHTMENU_BUTTONS_CONTAINER);
  buttonsContainer.appendChild(divider);
  buttonsContainer.appendChild(backToText);
  buttonsContainer.appendChild(divider.cloneNode(true));
  buttonsContainer.appendChild(fontSizeContainer);
}

function startMedian() {
  const textHighlightMenu = document.querySelector(HIGHLIGHTMENU_TEXT);
  const textHighlightMenuObserver = new MutationObserver(([mutation]) => { // Medium triggers observer for all menu buttons, so only first needed
    if (mutation.target.classList.contains(HIGHLIGHTMENU_ACTIVE_CLASS)) {
      injectMedian(textHighlightMenu);
    }
  });
  textHighlightMenuObserver.observe(textHighlightMenu, { attributes: true });

  const mediaHighlightMenu = document.querySelector(HIGHLIGHTMENU_MEDIA);
  const mediaHighlightMenuObserver = new MutationObserver(([mutation]) => {
    if (mutation.target.classList.contains(HIGHLIGHTMENU_ACTIVE_CLASS)) {
      injectImageOptions(mediaHighlightMenu);
    }
  });
  mediaHighlightMenuObserver.observe(mediaHighlightMenu, { attributes: true });
}

startMedian();

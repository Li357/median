/* global chrome, browser */

const api = typeof chrome !== 'undefined' ? chrome : browser;
api.webNavigation.onHistoryStateUpdated.addListener(({ tabId }) => {
  api.tabs.executeScript(tabId, { file:'/utils.js' });
  api.tabs.executeScript(tabId, { file:'/injector.js' });
  api.tabs.insertCSS(tabId, { file: '/inject.css' });
}, {
  url: [
    { urlMatches: 'https://medium.com/p/.*/edit' },
    { urlMatches: 'https://medium.com/new-story' },
  ],
});

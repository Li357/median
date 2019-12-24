/* global chrome, browser */

const api = typeof chrome !== "undefined" ? chrome : browser;
api.webNavigation.onHistoryStateUpdated.addListener(() => {
  ['/src/utils.js', '/src/injector.js'].forEach((file) => {
    api.tabs.executeScript(null, { file });
  });
});

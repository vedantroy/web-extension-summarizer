
/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 */

browser.tabs.executeScript({ file: "../inject-content/inject.js" })
    .then(listenForClicks);

function listenForClicks() {
    document.addEventListener('click', e => {

        if (!e.target.classList.contains('btn')) {
            return;
        } else {
            browser.tabs.query({ active: true, currentWindow: true })
                .then(tabs => {
                    browser.tabs.sendMessage(tabs[0].id, { summaryLength: e.target.id, targetURL: tabs[0].url });
                });
        }
    });
}
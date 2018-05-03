//Enable the polyfill for the content script and execute it in the current tab

browser.tabs.executeScript({ file: "/polyfills/browser-polyfill.js" }).then(loadContentScript).catch((error) => logError(error));

function loadContentScript() {
    browser.tabs.executeScript({ file: "/inject-content/inject.js" }).then(listenForClicks).catch((error) => logError(error));
}

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

function logError(error) {
    console.log(error);
}
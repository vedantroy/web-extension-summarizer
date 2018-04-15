/* 
TODO.txt
-Implement recognition of commas, periods, and new lines. (There are three patterns: 
																					[SM_g]word[SM_h]
																					[SM_g]word[SM_h]<punctuation_mark> (e.g - [SM_g]word[SM_h].)
																					[SM_g]word[SM_h]<punctuation_mark>[SM_1])																			where [SM_1] denotes a 'newline'
//Fix mysterious error where sometimes the summary doesn't show up. How do I verify it's not a console error? 
*/


/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * TODO: If we couldn't inject the script, handle the error.
 */

browser.tabs.executeScript({ file: "../inject.js" })
    .then(listenForClicks);

function listenForClicks() {
    document.addEventListener('click', e => {

        if (!e.target.classList.contains('summary-button')) {
            return;
        } else {
            browser.tabs.query({ active: true, currentWindow: true })
                .then(tabs => {
                    browser.tabs.sendMessage(tabs[0].id, { summaryLength: e.target.id, targetURL: tabs[0].url });
                });
        }
    });
}
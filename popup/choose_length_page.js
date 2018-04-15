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

//Integrate both of these functions into createSummaryBox

function changeUI() {
    window.location.href = '../summary_page/summary_page.html';
}

function onError(error) {
    console.log(error);
}

const returnSummary = function(summaryLength) {
    return new Promise((resolve, reject) => {

        browser.tabs.query({ active: true, currentWindow: true })
            .then(tabs => {

                const activeTabURL = tabs[0].url;
                const nonTokenURL = 'https://smmry.com/' + activeTabURL + '#&SM_LENGTH=' + summaryLength.toString();

                fetch(nonTokenURL)
                    .then((nonTokenResponse) => nonTokenResponse.text())
                    .then(nonTokenResponseText => {

                        const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                        const summaryTokenCompiledURL = 'https://smmry.com/sm_portal.php?&SM_TOKEN=' + summaryToken[1] + '&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=' + summaryLength.toString() + '&SM_URL=' + activeTabURL;

                        browser.tabs.create({ url: summaryTokenCompiledURL });

                        fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                            .then(tokenResponseText_initial => {

                                const tokenResponseText_fixedPeriodsCommas = tokenResponseText_initial.replace(/(\[SM_g].*?)(\[SM_h])([.,])/g, "$1$3$2");

                                const wordCompilationRegex = /\[SM_g](.*?)\[SM_h]/g;
                                var wordRegexResponse;

                                var summary = "";

                                do {
                                    wordRegexResponse = wordCompilationRegex.exec(tokenResponseText_fixedPeriodsCommas);
                                    if (wordRegexResponse) {
                                        summary += wordRegexResponse[1] + " ";
                                    }
                                } while (wordRegexResponse);

                                //Replace all &#039; with apostrophe. This is only a ***temporary*** fix b/c doesn't work with other quirky characters
                                summary = summary.replace(/&#039;/g, '\'');

                                resolve(returnSummaryResponse(summary, tokenResponseText_initial));
                            });
                    });
            });
    });
};

function returnSummaryResponse(summary, rawTokenText) {
    if (summary != "") {
        return { status: 'no-error', summary: summary };
    } else if (rawTokenText.includes('THE PAGE IS IN AN UNRECOGNISABLE FORMAT')) {
        return { status: 'Error - Unrecognisable Format', summary: null }
    } else if (rawTokenText.includes('SOURCE IS TOO SHORT')) {
        return { status: 'Error - Too Short', summary: null };
    } else if (rawTokenText.includes('THE PAGE IS TOO LONG TO RETRIEVE')) {
        return { status: 'Error - Too Long', summary: null };
    } else {
        return { status: 'Error - Unknown Error', summary: null };
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
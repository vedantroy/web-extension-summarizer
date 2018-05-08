(function() {

    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    var currentURL;
    var currentLength;
    const colorHex = { normal: "#52575C", error: "#9E0E28" };

    /**
     * Listen for messages from the background script.
     * Call the "Summarizer" function
     */
    browser.runtime.onMessage.addListener((message) => {

        const outerDivID = "rstudios-web-extension-summarizer-88A178C0FD69FEDDB3ACFD0F5234D949AB2EE6543718774D5E2D331BF8376B99-fruit-jam-4EEC889A8A3E73A7BF00773FDD16AC859E7AEF517673DFD7C143BC327CBBC30C";

        if (!document.getElementById(outerDivID)) {

            const cleanslateCSS_ID = "rstudios-web-extension-summarizer-cleanslate-CSS";

            if (!document.getElementById(cleanslateCSS_ID)) {
                var head = document.getElementsByTagName("head")[0];
                var link = document.createElement("link");
                link.id = cleanslateCSS_ID;
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = browser.extension.getURL("inject-content/cleanslate.css");
                head.appendChild(link);
            }

            var iFrame = document.createElement("iFrame");
            iFrame.id = "contentFrame";
            iFrame.classList.add("cleanslate");
            iFrame.style.cssText = "width: 100% !important; height: 100% !important; border: none !important;";
            iFrame.src = browser.extension.getURL("inject-content/inject.html");

            var boxDiv = document.createElement("div");
            boxDiv.classList.add("cleanslate");
            boxDiv.style.cssText = "background: white !important; box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 9px 8px !important; height: 100% !important; left: calc(100% - 390px) !important; position: fixed !important; top: 0px !important; width: 390px !important; padding: 0px !important; z-index: 1 !important;"

            var zeroDiv = document.createElement("div");
            zeroDiv.classList.add("cleanslate");
            zeroDiv.style.cssText = "position: fixed !important; width: 0px !important; height: 0px !important; top: 0px !important; left: 0px !important; z-index: 2147483647 !important;";

            var outerDiv = document.createElement("div");
            zeroDiv.classList.add("cleanslate");
            outerDiv.id = outerDivID;

            boxDiv.appendChild(iFrame);
            zeroDiv.appendChild(boxDiv);
            outerDiv.appendChild(zeroDiv);
            document.body.appendChild(outerDiv);

            window.addEventListener("message", () => {
                if (event.data == "summarizer-web-extension-action-close") {
                    document.getElementById(outerDivID).remove();
                } else if (event.data == "summarizer-web-extension-status-firstLoadFinished") {
                    updateSummaryBox(message.summaryLength, message.targetURL);
                } else if (event.data == "summarizer-web-extension-status-retrieve-summary") {
                    var iFrameWindow = document.getElementById("contentFrame").contentWindow;

                    const summary = returnSummary(currentLength, currentURL).then(summary => {
                        if (summary.status == "no-error") {
                            iFrameWindow.postMessage({ color: colorHex.normal, message: summary.summary }, "*");
                        } else {
                            iFrameWindow.postMessage({ color: colorHex.error, message: summary.status }, "*");
                        }
                    }, error => {
                        var errorString;
                        if (error.message.includes("NetworkError")) {
                            errorString = returnExceptionString(error, "returnSummary()", "This error can happen if your internet connection is blocking access to certain websites, including the one this extension uses to generate summaries.");
                        } else {
                            errorString = returnExceptionString(error, "returnSummary()");
                        }
                        iFrameWindow.postMessage({ color: colorHex.error, message: errorString }, "*");
                    });
                }
            }, false);

        } else {
            updateSummaryBox(message.summaryLength, message.targetURL);
        }
    });

    const updateSummaryBox = function(summaryLength, summaryURL) {

        var iFrameWindow = document.getElementById("contentFrame").contentWindow;

        currentLength = summaryLength;
        currentURL = summaryURL;

        iFrameWindow.postMessage({ color: colorHex.normal, message: "Loading...", specialStatus: "awaiting-response" }, "*");
    }

    const returnSummary = function(summaryLength, targetURL) {

        const nonTokenURL = 'https://smmry.com/' + targetURL + '#&SM_LENGTH=' + summaryLength.toString();

        return new Promise((resolve, reject) => {
            fetch(nonTokenURL)
                .then((nonTokenResponse) => nonTokenResponse.text())
                .then(nonTokenResponseText => {
                    const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                    const summaryTokenCompiledURL = 'https://smmry.com/sm_portal.php?&SM_TOKEN=' + summaryToken[1] + '&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=' + summaryLength.toString() + '&SM_URL=' + targetURL;
                    return fetch(summaryTokenCompiledURL);
                }).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                .then(tokenResponseText_initial => {
                    tokenResponseText_processed = tokenResponseText_initial.replace(/(\[SM_g].*?)(\[SM_h])((?:[.,?:!;%*+-<>=@_~^]|\[SM_l]| ?&quot;| ?&#039;| ?\\"){0,3})/g, "$1$3$2");

                    const wordCompilationRegex = /\[SM_g]([\s\S]*?)\[SM_h]/g;
                    var wordRegexResponse;

                    var summary = "";

                    do {
                        wordRegexResponse = wordCompilationRegex.exec(tokenResponseText_processed);
                        if (wordRegexResponse) {

                            wordRegexResponse[1] = wordRegexResponse[1].replace("[SM_l]", "\n\n");

                            wordRegexResponse[1] = wordRegexResponse[1].replace('\\"', '"');

                            if (wordRegexResponse[1].includes(" &#039;") || wordRegexResponse[1].includes(" &quot;") || wordRegexResponse[1].includes(" \"")) {
                                summary += wordRegexResponse[1];
                            } else {
                                summary += wordRegexResponse[1] + " ";
                            }
                        }
                    } while (wordRegexResponse);

                    summary = summary.replace(/&#039;/g, '\'');

                    resolve(returnSummaryResponse(summary, tokenResponseText_initial));
                }).catch((error) => reject(error));
        });
    }

    const returnSummaryResponse = function(summary, rawTokenText) {
        if (summary != "") {
            return { status: 'no-error', summary: summary };
        } else if (rawTokenText.includes('THE PAGE IS IN AN UNRECOGNISABLE FORMAT')) {
            return { status: 'Error - The Page Is in an Unrecognisable Format', summary: null }
        } else if (rawTokenText.includes('SOURCE IS TOO SHORT')) {
            return { status: 'Error - Source Is Too Short', summary: null };
        } else if (rawTokenText.includes('THE PAGE IS TOO LONG TO RETRIEVE')) {
            return { status: 'Error - The Page Is Too Long to Retrieve', summary: null };
        } else {
            return { status: 'Error - Unknown Error', summary: null };
        }
    }

    const returnExceptionString = function(error, methodName, customMessage) {
        var exceptionString = "Handled Exception: " + error.message + "\nFile: " + error.fileName + "\nMethod: " + methodName + "\nLine: " + error.lineNumber + "\nMessage: ";
        if (customMessage != undefined) {
            return exceptionString + customMessage;
        } else {
            return exceptionString + "This is an unexpected error. Please report the above information to the developer.";
        }
    }
})();
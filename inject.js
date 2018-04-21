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

    /**
     * Listen for messages from the background script.
     * Call the "Summarizer" function
     */
    browser.runtime.onMessage.addListener((message) => {

        const outerDivID = "rstudios-web-extension-summarizer-88A178C0FD69FEDDB3ACFD0F5234D949AB2EE6543718774D5E2D331BF8376B99-fruit-jam-4EEC889A8A3E73A7BF00773FDD16AC859E7AEF517673DFD7C143BC327CBBC30C";

        if (!document.getElementById(outerDivID)) {
            var iFrame = document.createElement("iFrame");
            iFrame.id = "contentFrame";
            iFrame.style.cssText = "width: 100%; height: 100%; border: none;";
            iFrame.src = browser.extension.getURL("inject.html");

            var boxDiv = document.createElement("div");
            boxDiv.style.cssText = "background: white; box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 9px 8px; height: 100%; left: calc(100% - 390px); position: fixed; top: 0px; width: 390px; z-index: 1;"

            var zeroDiv = document.createElement("div");
            zeroDiv.style.cssText = "position: fixed; width: 0px; height: 0px; top: 0px; left: 0px; z-index: 2147483647;";

            var outerDiv = document.createElement("div");
            outerDiv.id = outerDivID;

            boxDiv.appendChild(iFrame);
            zeroDiv.appendChild(boxDiv);
            outerDiv.appendChild(zeroDiv);
            document.body.appendChild(outerDiv);

            iFrame.onload = () => {
                var closeButton = iFrame.contentWindow.document.getElementById("close-btn");

                closeButton.addEventListener("click", () => {
                    outerDiv.remove();
                });

                var copyButton = iFrame.contentWindow.document.getElementById("copy-btn");

                copyButton.addEventListener("click", () => {
                    console.log("Clicking Copy Button");
                    var sBox = iFrame.contentWindow.document.getElementById("summary");
                    console.log(sBox.innerHTML);
                    var range = document.createRange();
                    var selection = window.getSelection();
                    range.selectNodeContents(sBox);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        console.log('Copying text command was ' + msg);
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }

                });

                updateSummaryBox(message.summaryLength, message.targetURL);
            }
        } else {
            var summaryBox_no_duplicate = document.getElementById("contentFrame").contentWindow.document.getElementById("summary");
            summaryBox_no_duplicate.innerHTML = "Loading...";
            updateSummaryBox(message.summaryLength, message.targetURL);
        }
    });

    function updateSummaryBox(summaryLength, summaryURL) {
        returnSummary(summaryLength, summaryURL).then(summary => {

            var summaryBox = document.getElementById("contentFrame").contentWindow.document.getElementById("summary");

            if (summary.status == "no-error") {
                summaryBox.innerHTML = summary.summary;
            } else {
                summaryBox.innerHTML = summary.status;
            }
        });
    }

    const returnSummary = function(summaryLength, targetURL) {
        return new Promise((resolve, reject) => {

            const nonTokenURL = 'https://smmry.com/' + targetURL + '#&SM_LENGTH=' + summaryLength.toString();

            fetch(nonTokenURL)
                .then((nonTokenResponse) => nonTokenResponse.text())
                .then(nonTokenResponseText => {

                    const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                    const summaryTokenCompiledURL = 'https://smmry.com/sm_portal.php?&SM_TOKEN=' + summaryToken[1] + '&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=' + summaryLength.toString() + '&SM_URL=' + targetURL;

                    //console.log(summaryTokenCompiledURL);

                    fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                        .then(tokenResponseText_initial => {
                            //tokenResponseText_initial = "[SM_g]This[SM_h][SM_g]is[SM_h][SM_g]a[SM_h][SM_g]sentence[SM_h].[SM_l][SM_g]Here[SM_h][SM_g]is[SM_h][SM_g]another[SM_h][SM_g]sentence[SM_h].[SM_1]"

                            //Backup regex: /(\[SM_g].*?)(\[SM_h])((?:[.,?]|\[SM_l]| ?&quot;){0,3})/g 	 | ?\\"

                            tokenResponseText_processed = tokenResponseText_initial.replace(/(\[SM_g].*?)(\[SM_h])((?:[.,?:!;%*+-<>=@_~^]|\[SM_l]| ?&quot;| ?&#039;| ?\\"){0,3})/g, "$1$3$2");

                            const wordCompilationRegex = /\[SM_g]([\s\S]*?)\[SM_h]/g;
                            var wordRegexResponse;

                            var summary = "";

                            do {
                                wordRegexResponse = wordCompilationRegex.exec(tokenResponseText_processed);
                                if (wordRegexResponse) {
                                    //console.log("Word Regex Response: " + wordRegexResponse[1] + "\n -----");

                                    wordRegexResponse[1] = wordRegexResponse[1].replace("[SM_l]", "\n\n");

                                    wordRegexResponse[1] = wordRegexResponse[1].replace('\\"', '"');

                                    if (wordRegexResponse[1].includes(" &#039;") || wordRegexResponse[1].includes(" &quot;") || wordRegexResponse[1].includes(" \"")) {
                                        summary += wordRegexResponse[1];
                                    } else {
                                        summary += wordRegexResponse[1] + " ";
                                    }
                                }
                            } while (wordRegexResponse);

                            //Replace all &#039; with apostrophe. This is only a ***temporary*** fix b/c doesn't work with other quirky characters
                            summary = summary.replace(/&#039;/g, '\'');

                            resolve(returnSummaryResponse(summary, tokenResponseText_initial));
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
})();
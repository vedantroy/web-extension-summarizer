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

            iFrame.onload = () => {
                var closeButton = iFrame.contentWindow.document.getElementById("close-btn");

                closeButton.addEventListener("click", () => {
                    outerDiv.remove();
                });

                var copyButton = iFrame.contentWindow.document.getElementById("copy-btn");

                copyButton.addEventListener("click", () => {
                    let summaryContainer = iFrame.contentWindow.document.getElementById("summary");
                    var textarea_temp = document.createElement("textarea");
                    textarea_temp.style.position = 'fixed';
                    textarea_temp.style.top = 0;
                    textarea_temp.style.left = 0;
                    textarea_temp.style.width = '2em';
                    textarea_temp.style.height = '2em';
                    textarea_temp.style.padding = 0;
                    textarea_temp.style.border = 'none';
                    textarea_temp.style.outline = 'none';
                    textarea_temp.style.boxShadow = 'none';
                    textarea_temp.style.background = 'transparent';
                    textarea_temp.value = summaryContainer.innerHTML;
                    document.body.appendChild(textarea_temp);
                    textarea_temp.focus();
                    textarea_temp.select();
                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        console.log('Copying text command was ' + msg);
                    } catch (error) {
                        console.log('Error: ' + error);
                    }

                    document.body.removeChild(textarea_temp);

                });

                updateSummaryBox(message.summaryLength, message.targetURL);
            }
        } else {
            updateSummaryBox(message.summaryLength, message.targetURL);
        }
    });

    function updateSummaryBox(summaryLength, summaryURL) {
        var summaryBox_no_duplicate = document.getElementById("contentFrame").contentWindow.document.getElementById("summary");
        summaryBox_no_duplicate.innerHTML = "Loading...";

        returnSummary(summaryLength, summaryURL).then(summary => {

            var summaryBox = document.getElementById("contentFrame").contentWindow.document.getElementById("summary");

            if (summary.status == "no-error") {
                summaryBox.innerHTML = summary.summary;
                summaryBox.style.setProperty("color", "#52575C");
            } else {
                summaryBox.innerHTML = summary.status;
                summaryBox.style.setProperty("color", "#9E0E28");
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

                    fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                        .then(tokenResponseText_initial => {
                            //tokenResponseText_initial = "[SM_g]This[SM_h][SM_g]is[SM_h][SM_g]a[SM_h][SM_g]sentence[SM_h].[SM_l][SM_g]Here[SM_h][SM_g]is[SM_h][SM_g]another[SM_h][SM_g]sentence[SM_h].[SM_1]"

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
                        });
                });
        });
    };

    function returnSummaryResponse(summary, rawTokenText) {
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
})();
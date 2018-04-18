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

		var iFrame = document.createElement("iFrame");
		iFrame.id = "contentFrame";
		iFrame.style.cssText = "width: 100%; height: 100%; border: none;";
		iFrame.src = browser.extension.getURL("inject.html");

		var boxDiv = document.createElement("div");
		boxDiv.style.cssText = "background: white; box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 9px 8px; height: 100%; left: calc(100% - 390px); position: fixed; top: 0px; width: 390px; z-index: 1;"

		var zeroDiv = document.createElement("div");
		zeroDiv.style.cssText = "position: fixed; width: 0px; height: 0px; top: 0px; left: 0px; z-index: 2147483647;";

		var outerDiv = document.createElement("div");

		boxDiv.appendChild(iFrame);
		zeroDiv.appendChild(boxDiv);
		outerDiv.appendChild(zeroDiv);
		document.body.appendChild(outerDiv);

        returnSummary(message.summaryLength, message.targetURL).then(summary => {

        	summaryBox = document.getElementById("contentFrame").contentWindow.document.getElementById("summary");

        	if(summary.status == "no-error") {
        		summaryBox.innerHTML = summary.summary;

        	} else {
        		summaryBox.innerHTML = summary.status;
        	}
        });
    });

    const returnSummary = function(summaryLength, targetURL) {
        return new Promise((resolve, reject) => {

            const nonTokenURL = 'https://smmry.com/' + targetURL + '#&SM_LENGTH=' + summaryLength.toString();

            fetch(nonTokenURL)
                .then((nonTokenResponse) => nonTokenResponse.text())
                .then(nonTokenResponseText => {

                    const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                    const summaryTokenCompiledURL = 'https://smmry.com/sm_portal.php?&SM_TOKEN=' + summaryToken[1] + '&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=' + summaryLength.toString() + '&SM_URL=' + targetURL;

                    //Temporary
                    console.log(summaryTokenCompiledURL);

                    fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                        .then(tokenResponseText_initial => {

                            const tokenResponseText_fixedPeriodsCommas = tokenResponseText_initial.replace(/(\[SM_g].*?)(\[SM_h])([.,])/g, "$1$3$2");

                            console.log("Fixed for Periods/Commas: " + tokenResponseText_fixedPeriodsCommas);

                            const tokenResponseText_fixedNewLines = tokenResponseText_fixedPeriodsCommas.replace(/(\[SM_g].*?)(\[SM_h]\[SM_I])/g, "$1\n");

                            //This doesn't work yet
                            console.log("Fixed For New Lines:" + tokenResponseText_fixedNewLines);

                            const wordCompilationRegex = /\[SM_g](.*?)\[SM_h]/g;
                            var wordRegexResponse;

                            var summary = "";

                            do {
                                wordRegexResponse = wordCompilationRegex.exec(tokenResponseText_fixedNewLines);
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
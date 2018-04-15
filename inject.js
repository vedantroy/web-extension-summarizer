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

        console.log("Trying to inject iFrame");

        var iframe = document.createElement("iframe");
        iframe.src = browser.extension.getURL("inject.html");

        iframe.width = 300;
        iframe.height = 300;

        document.body.appendChild(iframe);


        returnSummary(message.summaryLength, message.targetURL).then(summary => {
            //Do something (probably a good idea)

            console.log(summary.summary);

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
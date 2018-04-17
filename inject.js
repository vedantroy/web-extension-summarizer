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
            //Do something (probably a good idea)
            document.getElementById("contentFrame").contentWindow.document.getElementById("summary").innerHTML = "As Kushner grappled with the complexities of Middle East politics, he and M.B.S. began a conversation by telephone and e-mail. M.B.S. had his own ideas about how to remake the Middle East. In a statement on June 5th, the Saudi government accused Qatar of Dividing internal Saudi ranks, instigating against the state, infringing on its sovereignty, adopting various terrorist and sectarian groups aimed at destabilizing the region. The same day, Saudi Arabia and the Emirates, along with Bahrain, announced that they were blockading Qatar and breaking off diplomatic relations. Soon after Kushner departed, M.B.S. held a meeting with Mahmoud Abbas, the leader of the Palestinian Authority, to discuss the prospects for peace in the Middle East. Hariri got the call as he was preparing for lunch with Françoise Nyssen, the French minister of culture, but he was not in a position to ignore M.B.S. Hariri was a Saudi citizen, and his construction company, Saudi Oger, which was deeply in debt, had done millions of dollars worth of projects for the Saudi state. A senior American official in the Middle East told me that the plot was The dumbest thing I've ever seen. But there were indications that M.B.S. had coördinated his moves with the Trump Administration, possibly at the summit in Riyadh. As Kushner grappled with the complexities of Middle East politics, he and M.B.S. began a conversation by telephone and e-mail. M.B.S. had his own ideas about how to remake the Middle East. In a statement on June 5th, the Saudi government accused Qatar of Dividing internal Saudi ranks, instigating against the state, infringing on its sovereignty, adopting various terrorist and sectarian groups aimed at destabilizing the region. The same day, Saudi Arabia and the Emirates, along with Bahrain, announced that they were blockading Qatar and breaking off diplomatic relations. Soon after Kushner departed, M.B.S. held a meeting with Mahmoud Abbas, the leader of the Palestinian Authority, to discuss the prospects for peace in the Middle East. Hariri got the call as he was preparing for lunch with Françoise Nyssen, the French minister of culture, but he was not in a position to ignore M.B.S. Hariri was a Saudi citizen, and his construction company, Saudi Oger, which was deeply in debt, had done millions of dollars worth of projects for the Saudi state. A senior American official in the Middle East told me that the plot was The dumbest thing I've ever seen. But there were indications that M.B.S. had coördinated his moves with the Trump Administration, possibly at the summit in Riyadh. As Kushner grappled with the complexities of Middle East politics, he and M.B.S. began a conversation by telephone and e-mail. M.B.S. had his own ideas about how to remake the Middle East. In a statement on June 5th, the Saudi government accused Qatar of Dividing internal Saudi ranks, instigating against the state, infringing on its sovereignty, adopting various terrorist and sectarian groups aimed at destabilizing the region. The same day, Saudi Arabia and the Emirates, along with Bahrain, announced that they were blockading Qatar and breaking off diplomatic relations. Soon after Kushner departed, M.B.S. held a meeting with Mahmoud Abbas, the leader of the Palestinian Authority, to discuss the prospects for peace in the Middle East. Hariri got the call as he was preparing for lunch with Françoise Nyssen, the French minister of culture, but he was not in a position to ignore M.B.S. Hariri was a Saudi citizen, and his construction company, Saudi Oger, which was deeply in debt, had done millions of dollars worth of projects for the Saudi state. A senior American official in the Middle East told me that the plot was The dumbest thing I've ever seen. But there were indications that M.B.S. had coördinated his moves with the Trump Administration, possibly at the summit in Riyadh. As Kushner grappled with the complexities of Middle East politics, he and M.B.S. began a conversation by telephone and e-mail. M.B.S. had his own ideas about how to remake the Middle East. In a statement on June 5th, the Saudi government accused Qatar of Dividing internal Saudi ranks, instigating against the state, infringing on its sovereignty, adopting various terrorist and sectarian groups aimed at destabilizing the region. The same day, Saudi Arabia and the Emirates, along with Bahrain, announced that they were blockading Qatar and breaking off diplomatic relations. Soon after Kushner departed, M.B.S. held a meeting with Mahmoud Abbas, the leader of the Palestinian Authority, to discuss the prospects for peace in the Middle East. Hariri got the call as he was preparing for lunch with Françoise Nyssen, the French minister of culture, but he was not in a position to ignore M.B.S. Hariri was a Saudi citizen, and his construction company, Saudi Oger, which was deeply in debt, had done millions of dollars worth of projects for the Saudi state. A senior American official in the Middle East told me that the plot was The dumbest thing I've ever seen. But there were indications that M.B.S. had coördinated his moves with the Trump Administration, possibly at the summit in Riyadh. As Kushner grappled with the complexities of Middle East politics, he and M.B.S. began a conversation by telephone and e-mail. M.B.S. had his own ideas about how to remake the Middle East. In a statement on June 5th, the Saudi government accused Qatar of Dividing internal Saudi ranks, instigating against the state, infringing on its sovereignty, adopting various terrorist and sectarian groups aimed at destabilizing the region. The same day, Saudi Arabia and the Emirates, along with Bahrain, announced that they were blockading Qatar and breaking off diplomatic relations. Soon after Kushner departed, M.B.S. held a meeting with Mahmoud Abbas, the leader of the Palestinian Authority, to discuss the prospects for peace in the Middle East. Hariri got the call as he was preparing for lunch with Françoise Nyssen, the French minister of culture, but he was not in a position to ignore M.B.S. Hariri was a Saudi citizen, and his construction company, Saudi Oger, which was deeply in debt, had done millions of dollars worth of projects for the Saudi state. A senior American official in the Middle East told me that the plot was The dumbest thing I've ever seen. But there were indications that M.B.S. had coördinated his moves with the Trump Administration, possibly at the summit in Riyadh. As Kushner grappled with the complexities of Middle East politics, he and M.B.S. began a conversation by telephone and e-mail. M.B.S. had his own ideas about how to remake the Middle East. In a statement on June 5th, the Saudi government accused Qatar of Dividing internal Saudi ranks, instigating against the state, infringing on its sovereignty, adopting various terrorist and sectarian groups aimed at destabilizing the region. The same day, Saudi Arabia and the Emirates, along with Bahrain, announced that they were blockading Qatar and breaking off diplomatic relations. Soon after Kushner departed, M.B.S. held a meeting with Mahmoud Abbas, the leader of the Palestinian Authority, to discuss the prospects for peace in the Middle East. Hariri got the call as he was preparing for lunch with Françoise Nyssen, the French minister of culture, but he was not in a position to ignore M.B.S. Hariri was a Saudi citizen, and his construction company, Saudi Oger, which was deeply in debt, had done millions of dollars worth of projects for the Saudi state. A senior American official in the Middle East told me that the plot was The dumbest thing I've ever seen. But there were indications that M.B.S. had coördinated his moves with the Trump Administration, possibly at the summit in Riyadh. ";
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
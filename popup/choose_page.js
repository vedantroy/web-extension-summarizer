/* 
TODO.txt
-Implement recognition of commas, periods, and new lines. (There are three patterns: 
																					[SM_g]word[SM_h]
																					[SM_g]word[SM_h]<punctuation_mark> (e.g - [SM_g]word[SM_h].)
																					[SM_g]word[SM_h]<punctuation_mark>[SM_1])

																					where [SM_1] denotes a "newline"


Figure out how to do elegant async calls with returnSummary()
*/


document.addEventListener("click", e => {

    const buttonID = getButtonID(e.target);

    if (!(buttonID === "no-button-clicked") && !(buttonID == "button-clicked-but-no-id")) {
    	//call returnSummary function and return its value
    	returnSummary(buttonID);
    } else {
        console.log(buttonID);
    }
});


function returnSummary(summaryLength) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {

            const activeTabURL = tabs[0].url;
            const nonTokenURL = 'https://smmry.com/' + activeTabURL + '#&SM_LENGTH=' + summaryLength.toString();
            //console.log("URL: " + nonTokenURL)

            fetch(nonTokenURL)
                .then((nonTokenResponse) => nonTokenResponse.text())
                .then(nonTokenResponseText => {

                    const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                    const summaryTokenCompiledURL = "https://smmry.com/sm_portal.php?&SM_TOKEN=" + summaryToken[1] + "&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=" + summaryLength.toString() + "&SM_URL=" + activeTabURL;

                    browser.tabs.create({ url: summaryTokenCompiledURL });
                    fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                        .then(tokenResponseText => {
                        	//Include conditions for "Summary too short/Summary Unrecognized"
                        	const summaryRegexPattern = /\[SM_g](.*?)\[SM_h]/g;
	                        var match;

	                        var summary = "";

                        	do {
                        		match = summaryRegexPattern.exec(tokenResponseText);
                        		if(match) {
                        			summary += match[1] + " ";
                        		}
                        	} while (match);

                        	if(summary != "") {
                        		console.log("Summary: " + summary);
                        	} else if (tokenResponseText.includes('THE PAGE IS IN AN UNRECOGNISABLE FORMAT')) {
                        		console.log("CHROME-WEB-EXTENSION-ERROR-PAGE-UNRECOGNISABLE");
                        	} else if (tokenResponseText.includes('SOURCE IS TOO SHORT')) {
                        		console.log("CHROME-WEB-EXTENSION-ERROR-PAGE-TOO-SHORT");
                        	} else {
                        		console.log("CHROME-WEB-EXTENSION-ERROR-PAGE-TOO-SHORT");
                        	}
                        });
                })
        });
}


function getButtonID(clickedObject) {

    if (!clickedObject.classList.contains("summary-button")) {
        return "no-button-clicked";
    }

    switch (clickedObject.id) {
        case "b-3":
            return "3";
        case "b-5":
            return "5";
        case "b-7":
            return "7";
        default:
            return "button-clicked-but-no-id"
    }
}

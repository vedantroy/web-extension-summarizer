/* 
TODO.txt
-Implement recognition of commas, periods, and new lines. (There are three patterns: 
																					[SM_g]word[SM_h]
																					[SM_g]word[SM_h]<punctuation_mark> (e.g - [SM_g]word[SM_h].)
																					[SM_g]word[SM_h]<punctuation_mark>[SM_1])																			where [SM_1] denotes a 'newline'
//Fix mysterious error where sometimes the summary doesn't show up. How do I verify it's not a console error? 
*/


document.addEventListener('click', e => {

    const buttonID = getButtonID(e.target);

    if (!(buttonID === 'no-button-clicked') && !(buttonID == 'button-clicked-but-no-id')) {
        //call returnSummary function and return its value
        returnSummary(buttonID).then(summaryResponse => {

            const status = summaryResponse['status'];
            const summary = summaryResponse['summary'];

            if (status == 'no-error') {
                console.log(summary)
            } else if (status == 'Error - Unrecognisable Format') {
                console.log(status)
            } else if (status == 'Error - Too Short') {
                console.log(status)
            } else {
                console.log(status)
            }
        }, error => {
            console.log(error);
        })
    }
});


function getButtonID(clickedObject) {

    if (!clickedObject.classList.contains('summary-button')) {
        return 'no-button-clicked';
    }

    switch (clickedObject.id) {
        case 'b-3':
            return '3';
        case 'b-5':
            return '5';
        case 'b-7':
            return '7';
        default:
            return 'button-clicked-but-no-id'
    }
}

const returnSummary = function(summaryLength) {
    return new Promise((resolve, reject) => {
        browser.tabs.query({ active: true, currentWindow: true })
            .then(tabs => {

                const activeTabURL = tabs[0].url;
                const nonTokenURL = 'https://smmry.com/' + activeTabURL + '#&SM_LENGTH=' + summaryLength.toString();
                //console.log('URL: ' + nonTokenURL)

                fetch(nonTokenURL)
                    .then((nonTokenResponse) => nonTokenResponse.text())
                    .then(nonTokenResponseText => {

                        const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                        const summaryTokenCompiledURL = 'https://smmry.com/sm_portal.php?&SM_TOKEN=' + summaryToken[1] + '&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=' + summaryLength.toString() + '&SM_URL=' + activeTabURL;

                        browser.tabs.create({ url: summaryTokenCompiledURL });

                        fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                            .then(tokenResponseText => {

                            	//tokenResponseText = "randomtext[SM_g]Bad[SM_h][SM_a][SM_g]grammar[SM_h][SM_b][SM_g]example's[SM_h]";

                                const summaryRegexPattern = /\[SM_g](.*?)\[SM_h]/g;
                                var match;

                                var summary = "";

                                do {
                                    match = summaryRegexPattern.exec(tokenResponseText);
                                    if (match) {
                                        summary += match[1] + " ";
                                    }
                                } while (match);

                                //Replace all &#039; with apostrophe
                                summary = summary.replace(/&#039;/g, '\'');

                                resolve(returnSummaryResponse(summary, tokenResponseText));
                            });
                    });
            });
    });
};

function returnSummaryResponse(summary, tokenResponseText) {
    if (summary != "") {
        return { status: 'no-error', summary: summary };
    } else if (tokenResponseText.includes('THE PAGE IS IN AN UNRECOGNISABLE FORMAT')) {
        return { status: 'Error - Unrecognisable Format', summary: null }
    } else if (tokenResponseText.includes('SOURCE IS TOO SHORT')) {
        return { status: 'Error - Too Short', summary: null };
    } else {
        return { status: 'Error - Unknown Error', summary: null };
    }
}
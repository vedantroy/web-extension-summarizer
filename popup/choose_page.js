document.addEventListener("click", e => {

    const buttonID = getButtonID(e.target);

    if (!(buttonID === "no-button-clicked") && !(buttonID == "button-clicked-but-no-id")) {
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
            console.log("URL: " + nonTokenURL)

            fetch(nonTokenURL)
                .then((nonTokenResponse) => nonTokenResponse.text())
                .then(nonTokenResponseText => {
                    console.log("Fetching Token")
                    const summaryToken = nonTokenResponseText.match(/TOKEN=(.*?)&/);
                    const summaryTokenCompiledURL = "https://smmry.com/sm_portal.php?&SM_TOKEN=" + summaryToken[1] + "&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=" + summaryLength.toString() + "&SM_URL=" + activeTabURL;
                    console.log("Value of summaryTokenURL: " + summaryTokenCompiledURL);
                    fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text())
                        .then(tokenResponseText => {
                            console.log(tokenResponseText);
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

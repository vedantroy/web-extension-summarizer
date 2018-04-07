document.addEventListener("click", e => {

    const buttonID = getButtonID(e.target);

    if (!(buttonID === "no-button-clicked") && !(buttonID == "button-clicked-but-no-id")) {
        returnSummary(buttonID);
    } else {
        console.log(buttonID);
    }
});

/*
function returnSummaryV2(summaryLength) {
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
*/

function returnSummary(summaryLength) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {

            const activeTabURL = tabs[0].url;
            const nonTokenURL = 'https://smmry.com/' + activeTabURL + '#&SM_LENGTH=' + summaryLength.toString();
            console.log("URL: " + nonTokenURL)

            fetch(nonTokenURL)
                .then((nonTokenResponse) => nonTokenResponse.text())
                .then(nonTokenResponseText => {
                    if (nonTokenResponseText.includes("onmouseover=\"sm_flash_add(\'")) {
                        download("website_source.html", nonTokenResponseText);
                        //TODO: fix the problem where [?] shows up at the start of the response
                        const responseDocument = (new DOMParser()).parseFromString(nonTokenResponseText, 'text/html');
                        const documentBodyText = responseDocument.body.textContent;
                        const documentHeadText = responseDocument.head.textContent;
                        const summary = documentBodyText.match(/\[\?]\s*(.*?)Reduced/);
                        console.log("In logic branch - summary already exists. Printing out summary: \n" + summary);
                    } else {
                        //TODO - check if "&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&" can be changed
                        console.log("In logic branch - summary does not exist")
                        const summaryToken = initialSummaryResponseText.match(/TOKEN=(.*?)&/);
                        const summaryTokenCompiledURL = "https://smmry.com/sm_portal.php?&SM_TOKEN=" + summaryToken[1] + "&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=" + summaryLength.toString() + "&SM_URL=" + activeTabURL;
                        console.log("Value of summaryTokenURL: " + summaryTokenCompiledURL);

                        console.log("Fetching tokenSite");
                        fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text()).then(tokenResponseText => {
                            console.log("Fetched tokenSite");
                            console.log(tokenResponseText);
                        });


                        /*
                        fetch(summaryTokenCompiledURL).then((tokenSummaryResponse) => tokenSummaryResponse.text()).then(tokenSummaryResponseText => {
                            console.log("Printing out token page response: \n" + tokenSummaryResponseText);
                        })
                        */

                        //browser.tabs.create({ url: summaryTokenCompiledURL});


                        //Fetch new URL 
                        //"https://smmry.com/sm_portal.php?&SM_TOKEN=3347318480&SM_POST_SAVE=0&SM_REDUCTION=-1&SM_CHARACTER=-1&SM_LENGTH=7&SM_URL=http://www.wnd.com/2018/04/famous-rabbi-sees-trump-rebuilding-temple/?cat_orig=faith"


                    }
                    //download("website_source.html", responseText)
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



//Debug Functions
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Start file download.
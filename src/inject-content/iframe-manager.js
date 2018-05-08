var copyButton = document.getElementById("copy-btn");

copyButton.addEventListener("click", () => {
    let summaryContainer = document.getElementById("summary");
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

var closeButton = document.getElementById("close-btn");

closeButton.addEventListener("click", () => {
    window.parent.postMessage("summarizer-web-extension-close", "*");
});
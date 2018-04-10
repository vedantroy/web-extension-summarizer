console.log("Summary Page Loaded");
const summaryResponse = browser.storage.local.get("currentSummary").then(summary => {
	document.getElementById('summary-field').value = summary['currentSummary'];
}, error => {
	console.log(error);
});
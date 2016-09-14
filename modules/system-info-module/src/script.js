function systemInfo() {
	fetch ('/system-info-module/systemInfo').then(function(res) {
		return res.text();
	}).then(function(res) {
		document.querySelector("#system-info-module").innerHTML = res;
	}).catch(console.error)
}

function systemInfoStart() {
	systemInfo();
	winodw.setInterval(systemInfo(), 60000);
}
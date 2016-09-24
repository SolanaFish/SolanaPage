function media() {
	fetch ('/media/mainView').then(function(res) {
		return res.text();
	}).then(function(res) {
		document.querySelector("#media-controls-module").innerHTML = res;
	}).catch(console.error)
}

function play() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/media/controls", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("action=play");
	media();
}

function prev() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/media/controls", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("action=prev");
	media();
}

function next() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/media/controls", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("action=next");
	media();
}

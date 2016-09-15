const settingsDir = __dirname + "/../settings.json";
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require("fs"); // for reading settings
var playing = false;

function serverLog(text) {
	var date = new Date();
	console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
	var settingsFile = fs.readFileSync(settingsDir);
	return JSON.parse(settingsFile);
}

function puts(error, stdout, stderr) {
	if (error != null) {
		serverLog("error executing command: " + error)
	}
}

function play () {
	if (playing) {
		exec("playerctl pause");
	} else {
		exec("playerctl play");
	}
}

function next () {
	exec("playerctl next");
}

function prev () {
	exec("playerctl previous");
}

module.exports = function (app) {
	exec("playerctl pause");
	app.get('/media/mainView', module.exports.mainView);
	app.post('/media/controls', module.exports.controls);
	serverLog("Media controls module ready!");
}

module.exports.mainView = function (req, res) {
	res.render('media');
}

module.exports.controls = function (req, res) {
	var action = req.body.action;
	switch(action) {
		case 'play': {
			play();
		} break;
		case 'next': {
			next();
		} break;
		case 'prev': {
			prev();
		} break;
	}
}
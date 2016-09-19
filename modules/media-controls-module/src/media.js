const settingsDir = __dirname + "/../settings.json";
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require("fs"); // for reading settings
var bodyParser = require('body-parser'); // Basic parser (no multipart support)
var uep = bodyParser.urlencoded({ extended: false })
var playing = false;
var settings = readSettings();

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
		exec(settings.commands.pause);
	} else {
		exec(settings.commands.play);
	}
	playing = !playing
}

function next () {
	exec(settings.commands.next);
}

function prev () {
	exec(settings.commands.prev);
}

module.exports = function (app) {
	exec(settings.commands.pause);
	app.get('/media/mainView', module.exports.mainView);
	app.get('/media-controls-module/script.js', module.exports.scriptJS)
	app.post('/media/controls', uep, module.exports.controls);
	serverLog("Media controls module ready!");
}

module.exports.scriptJS = function (req, res) {
	res.sendFile(__dirname + "/script.js");
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
	res.sendStatus(200)
}
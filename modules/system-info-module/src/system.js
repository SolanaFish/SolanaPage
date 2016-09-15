const settingsDir = __dirname + "/../settings.json";
var os = require('os'); // for uptime 
var fs = require("fs"); // for reading settings
var settings = readSettings();

function serverLog(text) {
	var date = new Date();
	console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
	var settingsFile = fs.readFileSync(settingsDir);
	return JSON.parse(settingsFile);
}

module.exports = function (app) {
	app.get('/system-info-module/systemInfo', module.exports.systemInfo)
	app.get('/system-info-module/script.js', module.exports.scriptJS)
	serverLog("System info module ready!")
}

module.exports.systemInfo = function (req, res) {
	var uptime = {
		days: Math.floor((os.uptime()/86400)%86400),
		hours: Math.floor((os.uptime()/3600)%3600),
		minutes: Math.floor((os.uptime()/60)%60)
	}
	res.render('systemInfo', {"os":os, "settings": settings, "uptime": uptime})
}

module.exports.scriptJS = function(req, res) {
	res.sendFile(__dirname + "/script.js")
}

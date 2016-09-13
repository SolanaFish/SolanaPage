var express = require('express');
var app = express();
var fs = require("fs"); // for reading settings
var os = require('os'); // for uptime 
var settings = readSettings();
var modules = [];

function loadModules() {
	for (module in settings.modules) {
		if(settings.modules[module].active) {
			modules[module] = require("./" + settings.modules[module].name);
			modules[module](app);
		}
	}
}

function serverLog(text) {
	var date = new Date();
	console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
	var settingsFile = fs.readFileSync('./settings.json');
	return JSON.parse(settingsFile);
}

app.get('/system.json', function (req, res) {
	serverLog("Serving system.json");

	var totalMem = os.totalmem() / 1073741824
	var freeMem = os.freemem() / 1073741824
	totalMem = totalMem.toFixed(2); 
	freeMem = freeMem.toFixed(2);

	res.json({
		uptime:{
			Days: Math.floor((os.uptime()/86400)%86400),
			Hours: Math.floor((os.uptime()/3600)%3600),
			Minutes: Math.floor((os.uptime()/60)%60)
		},
		cpu:os.cpus(),
		memory:{
			total: totalMem,
			free: freeMem,
			percent: (os.freemem()/os.totalmem() * 100)
		},
		host: os.hostname(),
		system: os.release(),
	});
})

app.get('/', function(req,res) {
	serverLog("Serving main page");
	res.render('index', { "settings": settings});
})

var server = app.listen(8081, function () {
	var host = server.address().address
	var port = server.address().port
	serverLog('Server running on adress http://' + host + ':' + port);
	app.use("/", express.static('.'))
	app.use("/static", express.static('./static'))
	app.set('view engine', 'pug')
	serverLog("Loading modules!")
	loadModules();
	serverLog("Server up!")
})
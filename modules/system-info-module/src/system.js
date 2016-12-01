const settingsDir = __dirname + "/../settings.json";
var os = require('os'); // for uptime
var fs = require("fs"); // for reading settings
var settings = readSettings();
var pug = require('pug');

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
    var settingsFile = fs.readFileSync(settingsDir);
    return JSON.parse(settingsFile);
}

module.exports = function(app) {
    return new Promise(function(resolve, reject) {
        app.get('/system-info-module/systemInfo', systemInfo);
        app.get('/system-info-module/script.js', scriptJS);
        serverLog("System info module ready!");
        resolve();
    });
};

var systemInfo = function(req, res) {
    var uptime = {
        days: Math.floor((os.uptime() / 86400) % 86400),
        hours: Math.floor((os.uptime() / 3600) % 3600),
        minutes: Math.floor((os.uptime() / 60) % 60)
    };
    res.render('systemInfo', {
        "os": os,
        "settings": settings,
        "uptime": uptime
    });
};

var scriptJS = function(req, res) {
    res.sendFile(__dirname + "/script.js");
};

module.exports.getSettings = function() {
    return null;
};

module.exports.getMainView = function() {
    var uptime = {
        days: Math.floor((os.uptime() / 86400) % 86400),
        hours: Math.floor((os.uptime() / 3600) % 3600),
        minutes: Math.floor((os.uptime() / 60) % 60)
    };
    return pug.renderFile(`${__dirname}/../views/systemInfo.pug`, {
        "os": os,
        "settings": settings,
        "uptime": uptime
    });
};

var express = require('express');
var app = express();
var fs = require("fs"); // for reading settings
var settings = readSettings();
var modules = [];
var pug = require('pug');

function loadModules() {
    for (var module in settings.modules) {
        if (settings.modules[module].active) {
            modules[module] = require("./modules/" + settings.modules[module].name);
            modules[module](app);
        }
    }
}

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
    if (fs.existsSync('./settings.json')) {
        var settingsFile = fs.readFileSync('./settings.json');
        return JSON.parse(settingsFile);
    } else {
        var newSettings = {
            "modules": [{
                "name": "bookmarks-module",
                "active": true,
                "jsEntry": "bookmarks"
            }, {
                "name": "system-info-module",
                "active": true,
                "jsEntry": "systemInfoStart"
            }, {
                "name": "media-controls-module",
                "active": true,
                "jsEntry": "media"
            }],
            "imports": {
                "paper": [{
                    "name": "card"
                }, {
                    "name": "material"
                }, {
                    "name": "input"
                }, {
                    "name": "button"
                }, {
                    "name": "tabs"
                }, {
                    "name": "dropdown-menu"
                }, {
                    "name": "listbox"
                }, {
                    "name": "item"
                }, {
                    "name": "menu"
                }, {
                    "name": "dialog"
                }, {
                    "name": "toast"
                }],
                "iron": [{
                    "name": "form"
                }, {
                    "name": "icons"
                }, {
                    "name": "collapse"
                }, {
                    "name": "pages"
                }]
            }
        };
        var settingsString = JSON.stringify(newSettings, null, "	");
        fs.writeFileSync('./settings.json', settingsString);
        return newSettings;
    }
}

app.get('/', function(req, res) {
    serverLog("Serving main page");
    res.render('index', {
        "settings": settings
    });
});

app.get('/settings', function(req, res) {
    serverLog("Serving settings");
    console.log(settings);
    var generalSettings = pug.renderFile('views/generalSettings.pug', {settings: settings});
    var settingsInfo = {
        settings,
        generalSettings,
        moduleSettings: []
    };
    modules.forEach(function(moduleItem) {
        var settingsView = moduleItem.getSettings();
        if (settingsView !== null) {
            settingsInfo.moduleSettings.push(settingsView);
        }
    });
    res.render('settings', settingsInfo);
});

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    serverLog('Server running on adress http://' + host + ':' + port);
    app.use("/", express.static('.'));
    app.use("/static", express.static('./static'));
    app.set('view engine', 'pug');
    app.set('views', [`${__dirname}/modules/bookmarks-module/src`,`${__dirname}/views`]);
    serverLog("Loading modules!");
    loadModules();
    serverLog("Server up!");
});

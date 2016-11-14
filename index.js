var express = require('express');
var app = express();
var fs = require("fs"); // for reading settings
var modules = [];
var pug = require('pug');

var bodyParser = require('body-parser'); // Basic parser (no multipart support)
var uep = bodyParser.urlencoded({
    extended: false
});

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, 'wallpaper.jpg');
    }
});
var upload = multer({
    storage: storage
});



var settings = {
    load: () => {
        serverLog('Looking for local settings file');
        if (fs.existsSync('./settings.json')) {
            serverLog('Found local settings file, overriding defaults');
            var settingsFile = fs.readFileSync('./settings.json');
            settings.current = JSON.parse(settingsFile);
        } else {
            serverLog('Couldn\'t find local settings file, usings defaults');
        }
    },
    save: () => {
        serverLog('Saving settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync('./settings.json', stringified);
    },
    current: {
        modules: [{
            name: "bookmarks-module",
            active: true,
            jsEntry: "bookmarks"
        }, {
            name: "system-info-module",
            active: true,
            jsEntry: "systemInfoStart"
        }, {
            name: "media-controls-module",
            active: true,
            jsEntry: "media"
        }, {
            name: "reddit-wallpapers-module",
            active: true,
            jsEntry: "reddit"
        }]
    }
};

function loadModules() {
    settings.load();
    serverLog("Loading modules!");
    for (var module in settings.current.modules) {
        if (settings.current.modules[module].active) {
            modules[module] = require("./modules/" + settings.current.modules[module].name);
            modules[module](app);
        }
    }
}

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

app.get('/', function(req, res) {
    serverLog("Serving main page");
    var generalSettings = pug.renderFile('views/generalSettings.pug', {
        settings: settings.current
    });
    var renderInfo = {
        settings: settings.current,
        generalSettings,
        modules: [],
    };
    renderInfo.modules.push({
        module: "General settings",
        settingsView: pug.renderFile(`${__dirname}/views/generalSettings.pug`, {
            settings: settings.current
        })
    });
    var settingsReady = new Promise((Resolve, Reject) => {
        var settingsPromises = [];
        modules.forEach((moduleItem) => {
            settingsPromises.push(moduleItem.getSettings());
        });
        var settingsRendered = [];
        Promise.all(settingsPromises).then((value) => {
            value.forEach((promiseValue) => {
                settingsRendered.push(promiseValue);
            });
            Resolve(settingsRendered);
        }).catch((err) => {
            console.log(err);
        });
    });
    var mainReady = new Promise((Resolve, Reject) => {
        var mainPromises = [];
        modules.forEach((moduleItem) => {
            mainPromises.push(moduleItem.getMainView());
        });
        var mainRendered = [];
        Promise.all(mainPromises).then((value) => {
            value.forEach((promiseValue) => {
                mainRendered.push(promiseValue);
            });
            Resolve(mainRendered);
        }).catch((err) => {
            console.log(err);
        });
    });
    Promise.all([mainReady, settingsReady]).then((value) => {
        modules.forEach((moduleItem, argIndex) => {
            var moduleObject = {
                module: moduleItem.name,
                mainView: value[0][argIndex],
                settingsView: value[1][argIndex]
            };
            renderInfo.modules.push(moduleObject);
        });
        res.render('app', renderInfo);
    }).catch((err) => {
        console.log(err);
        res.status(500).send({
            error: 'Something went wrong, sorry'
        });
    });
});

app.get('/wallpaper.jpg', (req, res) => {
    fs.access(`${__dirname}/uploads/wallpaper.jpg`, (err) => {
        if (err) {
            res.sendFile(`${__dirname}/static/wall.jpg`);
        } else {
            res.sendFile(`${__dirname}/uploads/wallpaper.jpg`);
        }
    });
});

app.post('/updateModules', uep, (req, res) => {
    var updatedModules = [];
    JSON.parse(req.body.modules).forEach((item) => {
        updatedModules[item.name] = item.active;
    });
    /* jshint ignore:start */
    settings.current.modules.forEach((moduleItem) => {
        if (typeof updatedModules[moduleItem.name] !== "undefinied") {
            moduleItem.active = updatedModules[moduleItem.name];
        }
    });
    /* jshint ignore:end */
    settings.save();
    res.sendStatus(200);
    process.exit();
});

app.post('/changeWallpaper', upload.single('wallpaper'), (req, res) => {
    res.redirect('/');
});


var server = app.listen(8081, function() {
    app.use("/", express.static('.'));
    app.use("/static", express.static('./static'));
    app.set('view engine', 'pug');
    var views = [`${__dirname}/views`];
    settings.current.modules.forEach(function(moduleItem) {
        views.push(`${__dirname}/modules/${moduleItem.name}/views`);
    });
    app.set('views', views);
    loadModules();
    serverLog("Server up!");
});

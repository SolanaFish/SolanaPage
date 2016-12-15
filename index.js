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
    return new Promise((resolve, reject) => {
        settings.load();
        serverLog("Loading modules!");
        var promises = [];
        for (var module in settings.current.modules) {
            if (settings.current.modules[module].active) {
                modules[module] = require("./modules/" + settings.current.modules[module].name);
                promises.push(modules[module](app));
            }
        }
        Promise.all(promises).then(() => {
            resolve(`Loaded ${promises.length} modules!`);
        }).catch((err) => {
            reject(err);
        });
    });
}

function serverLog(text) {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
}

app.get('/', function(req, res) {
    serverLog("Serving main page");
    var renderInfo = {
        settings: settings.current,
        modules: [],
    };
    var generalCss = fs.readFile('./static/style.css', (err, data)=> {
        if(err) {
            console.log(err);
            res.sendStatus(501);
        } else {
            renderInfo.modules.push({
                module: "General",
                settingsView: pug.renderFile(`${__dirname}/views/generalSettings.pug`, {
                    settings: settings.current
                }),
                css: data
            });
            var settingsReady = new Promise((Resolve, Reject) => {
                var settingsPromises = [];
                modules.forEach((moduleItem) => {
                    settingsPromises.push(moduleItem.getSettings());
                });
                Promise.all(settingsPromises).then((value) => {
                    var settingsRendered = [];
                    value.forEach((promiseValue) => {
                        settingsRendered.push(promiseValue);
                    });
                    Resolve(settingsRendered);
                }).catch((err) => {
                    console.log(err);
                    res.sendStatus(501);
                });
            });
            var mainReady = new Promise((Resolve, Reject) => {
                var mainPromises = [];
                modules.forEach((moduleItem) => {
                    mainPromises.push(moduleItem.getMainView());
                });
                Promise.all(mainPromises).then((value) => {
                    var mainRendered = [];
                    value.forEach((promiseValue) => {
                        mainRendered.push(promiseValue);
                    });
                    Resolve(mainRendered);
                }).catch((err) => {
                    console.log(err);
                    res.sendStatus(501);
                });
            });

            var scriptsReady = new Promise((Resolve, Reject) => {
                var scriptPromises = [];
                modules.forEach((moduleItem) => {
                    scriptPromises.push(moduleItem.getScript());
                });
                Promise.all(scriptPromises).then((value) => {
                    var scripts = [];
                    value.forEach((script) => {
                        scripts.push(script);
                    });
                    Resolve(scripts);
                }).catch((err) => {
                    console.log(err);
                    res.sendStatus(501);
                });
            });

            var cssReady = new Promise((Resolve, Reject) => {
                var cssPromises = [];
                modules.forEach((moduleItem) => {
                    cssPromises.push(moduleItem.getCss());
                });
                Promise.all(cssPromises).then((value) => {
                    var csses = [];
                    value.forEach((css) => {
                        csses.push(css);
                    });
                    Resolve(csses);
                }).catch((err) => {
                    console.log(err);
                    res.sendStatus(501);
                });
            });

            Promise.all([mainReady, settingsReady, scriptsReady, cssReady]).then((value) => {
                modules.forEach((moduleItem, argIndex) => {
                    var moduleObject = {
                        module: moduleItem.niceName(),
                        mainView: value[0][argIndex],
                        settingsView: value[1][argIndex],
                        script: value[2][argIndex],
                        css: value[3][argIndex]
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

        }
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

app.get('/thumbnails/:id', (req, res) => {
    fs.access(`thumbnails/${req.params.id}`, (err) => {
        if (err) {
            res.sendFile(`${__dirname}/thumbnails/placeholder.png`);
        } else {
            res.sendFile(`${__dirname}/thumbnails/${req.params.id}`);
        }
    });
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
    loadModules().then((res) => {
        serverLog(res);
        serverLog("Server up!");
    }).catch((err) => {
        console.log(err);
    });
});

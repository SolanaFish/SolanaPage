const settingsDir = __dirname + "/../settings.json";
var sys = require('sys');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require("fs"); // for reading settings
var bodyParser = require('body-parser'); // Basic parser (no multipart support)
var uep = bodyParser.urlencoded({
    extended: false
});
var playing = false;
var settings = readSettings();
var pug = require('pug');

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
    if (fs.existsSync(settingsDir)) {
        var settingsFile = fs.readFileSync(settingsDir);
        return JSON.parse(settingsFile);
    } else { // If setttngs file does not exits, generate new one
        var newSettings = {
            "controlCommands": {
                "next": "playerctl next",
                "prev": "playerctl previous",
                "play": "playerctl play",
                "pause": "playerctl pause",
                "status": "playerctl status"
            },
            "infoCommands": {
                "title": "playerctl metadata title",
                "artist": "playerctl metadata artist",
                "url": "playerctl metadata mpris:artUrl"
            }
        };
        var settingsString = JSON.stringify(newSettings, null, "	");
        fs.writeFileSync(settingsDir, settingsString);
        return newSettings;
    }
}

function play() {
    if (playing) {
        exec(settings.controlCommands.pause);
    } else {
        exec(settings.controlCommands.play);
    }
    playing = !playing;
}

function next() {
    exec(settings.controlCommands.next);
}

function prev() {
    exec(settings.controlCommands.prev);
}

var title, artist, url;

function getInfo() {
    return new Promise(function(resolve, reject) {
        exec(settings.infoCommands.title, (error, stdout, stderr) => {
            if (error) {
                console.log("Error while getting song title");
            } else {
                title = stdout;
            }
            exec(settings.infoCommands.artist, (error, stdout, stderr) => {
                if (error) {
                    console.log("Error while getting song artist");
                } else {
                    artist = stdout;
                }
                exec(settings.infoCommands.url, (error, stdout, stderr) => {
                    if (error) {
                        console.log("Error while getting song url");
                    } else {
                        url = stdout;
                    }
                    if (title && artist && url) {
                        resolve({
                            title: title,
                            artist: artist,
                            imgUrl: url
                        });
                    } else {
                        reject("Error while getting song info");
                    }
                });
            });
        });
    });
}

module.exports = function(app) {
    if (execSync(settings.controlCommands.status).toString().indexOf("Paused") > -1 || execSync(settings.controlCommands.status).toString().indexOf("Stopped") > -1) { // check status of player
        playing = false;
    } else {
        playing = true;
    }
    app.get('/media/mainView', mainView);
    app.get('/media-controls-module/script.js', scriptJS);
    app.post('/media/controls', uep, controls);
    serverLog("Media controls module ready!");
};

var scriptJS = function(req, res) {
    res.sendFile(__dirname + "/script.js");
};

var mainView = function(req, res) {
    getInfo().then((info) => {
        res.render('media', info);
    }).catch((reason) => {
        serverLog("Error: " + reason);
    });
};

var controls = function(req, res) {
    var action = req.body.action;
    switch (action) {
        case 'play':
            {
                play();
            }
            break;
        case 'next':
            {
                next();
            }
            break;
        case 'prev':
            {
                prev();
            }
            break;
    }
    res.sendStatus(200);
};

module.exports.getSettings = function() {
    return Promise.resolve(null);
};

module.exports.getMainView = function() {
    return new Promise((Resolve, Reject) => {
        getInfo().then((info) => {
            Resolve(Promise.resolve(pug.renderFile(`${__dirname}/../views/media.pug`, info)));
        }).catch((err) => {
            Reject(err);
        });
    });
};

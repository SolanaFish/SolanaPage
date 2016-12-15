let settingsDir = __dirname + "/../settings.json";
var fs = require("fs"); // for reading settings
var exec = require('child_process').exec;
var pug = require('pug');
var bodyParser = require('body-parser'); // Basic parser (no multipart support)
var uep = bodyParser.urlencoded({
    extended: false
});

function serverLog(text) {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
}

var settings = {
    load: () => {
        if (fs.existsSync(settingsDir)) {
            settings.current = JSON.parse(fs.readFileSync(settingsDir));
        }
    },
    current: {
        controlCommands: {
            next: "playerctl next",
            prev: "playerctl previous",
            play: "playerctl play-pause"
        },
        infoCommands: {
            title: "playerctl metadata title",
            artist: "playerctl metadata artist",
            url: "playerctl metadata mpris:artUrl"
        }
    },
    save: () => {
        serverLog('Saving media module settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

var mediaControls = {
    play: () => {
        return new Promise((resolve, reject) => {
            exec(settings.current.controlCommands.play, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    },
    next: () => {
        return new Promise((resolve, reject) => {
            exec(settings.current.controlCommands.next, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    },
    prev: () => {
        return new Promise((resolve, reject) => {
            exec(settings.current.controlCommands.prev, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }
};

function getInfo() {
    var title, artist, url;
    return new Promise(function(resolve, reject) {
        exec(settings.current.infoCommands.title, (error, stdout, stderr) => {
            if (error) {
                console.log("Error while getting song title");
            } else {
                title = stdout;
            }
            exec(settings.current.infoCommands.artist, (error, stdout, stderr) => {
                if (error) {
                    console.log("Error while getting song artist");
                } else {
                    artist = stdout;
                }
                exec(settings.current.infoCommands.url, (error, stdout, stderr) => {
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
    return new Promise(function(resolve, reject) {
        settings.load();
        app.post('/media/controls', uep, controls);
        serverLog("Media controls module ready!");
        resolve();
    });
};

var scriptJS = function(req, res) {
    res.sendFile(__dirname + "/script.js");
};

var controls = function(req, res) {
    switch (req.body.action) {
        case 'play':
            {
                mediaControls.play().then(() => {
                    getInfo().then((info) => {
                        res.json(info);
                    });
                }).catch((err) => {
                    res.sendStatus(503);
                });
            }
            break;
        case 'next':
            {
                mediaControls.next().then(() => {
                    getInfo().then((info) => {
                        res.json(info);
                    });
                }).catch((err) => {
                    res.sendStatus(503);
                });
            }
            break;
        case 'prev':
            {
                mediaControls.prev().then(() => {
                    getInfo().then((info) => {
                        res.json(info);
                    });
                }).catch((err) => {
                    res.sendStatus(503);
                });
            }
            break;
        case 'update':
            {
                getInfo().then((info) => {
                    res.json(info);
                });
            }
            break;
    }
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

module.exports.getScript = function() {
    return new Promise(function(resolve, reject) {
        fs.readFile(`${__dirname}/script.js`, (err, data) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.getCss = function() {
    return new Promise(function(resolve, reject) {
        fs.readFile(`${__dirname}/style.css`, (err, data) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.niceName = function() {
    return 'Media info and controls';
};

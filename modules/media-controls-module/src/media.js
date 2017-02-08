let settingsDir = __dirname + "/../settings.json";
var fs = require("fs"); // for reading settings
var exec = require('child_process').exec;
var pug = require('pug');
var bodyParser = require('body-parser'); // Basic parser (no multipart support)
var uep = bodyParser.urlencoded({
    extended: false
});

var serverLog = (text) => {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
};

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

var getInfo = () => {
    return new Promise((resolve, reject) => {
        var title = new Promise((resolve, reject) => {
            exec(settings.current.infoCommands.title, (err, stdout, stderr)=> {
                if(err) {
                    reject("Error while getting song title");
                } else {
                    resolve(stdout);
                }
            });
        });
        var artist = new Promise((resolve, reject) => {
            exec(settings.current.infoCommands.artist, (err, stdout, stderr)=> {
                if(err) {
                    reject("Error while getting song artist");
                } else {
                    resolve(stdout);
                }
            });
        });
        var url = new Promise((resolve, reject) => {
            exec(settings.current.infoCommands.url, (err, stdout, stderr)=> {
                if(err) {
                    reject("Error while getting song url");
                } else {
                    resolve(stdout);
                }
            });
        });
        Promise.all([title, artist, url]).then((values)=> {
            resolve({
                title:values[0],
                artist: values[1],
                imgUrl: values[2]
            });
        }).catch((err)=> {
            reject(err);
        });
    });
};

module.exports = (app) => {
    return new Promise((resolve, reject) => {
        settings.load();
        app.post('/media/controls', uep, controls);
        serverLog("Media controls module ready!");
        resolve();
    });
};

var controls = (req, res) => {
    switch (req.body.action) {
        case 'play':
            {
                mediaControls.play().then(() => {
                    getInfo().then((info) => {
                        res.json(info);
                    });
                }).catch((err) => {
                    res.sendStatus(500);
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
                    res.sendStatus(500);
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
                    res.sendStatus(500);
                });
            }
            break;
        case 'update':
            {
                getInfo().then((info) => {
                    res.json(info);
                }).catch((err) => {
                    res.sendStatus(500);
                });
            }
            break;
    }
};

module.exports.getSettings = () => {
    return null;
};

module.exports.getMainView = () => {
    return new Promise((Resolve, Reject) => {
        getInfo().then((info) => {
            Resolve(Promise.resolve(pug.renderFile(`${__dirname}/../views/media.pug`, info)));
        }).catch((err) => {
            Reject(err);
        });
    });
};

module.exports.getScript = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}/script.js`, (err, data) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.getCss = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}/style.css`, (err, data) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.niceName = () => {
    return 'Media info and controls';
};

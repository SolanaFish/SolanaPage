let settingsDir = "./modules/spotify-module/settings.json";
let credentialsDir = "./modules/spotify-module/credentials.json";
const fs = require('fs');
const bodyParser = require('body-parser');
const pug = require('pug');
const uep = bodyParser.urlencoded({
    extended: false
});
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

var stateKey = 'spotify_auth_state';

var settings = {
    load: () => {
        if (fs.existsSync(settingsDir)) {
            settings.current = JSON.parse(fs.readFileSync(settingsDir));
        }
        if (fs.existsSync(credentialsDir)) {
            settings.credentials = JSON.parse(fs.readFileSync(credentialsDir));
        }
    },
    current: {

    },
    credentials: {
        id:'',
        secret:''
    },
    save: () => {
        serverLog('Saving reddit settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

function serverLog(text) {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
}

function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i = 0; i < length; ++i) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


module.exports = (app) => {
    return new Promise((resolve, reject) => {
        settings.load();
        app.use(cookieParser());
        app.get('/spotify/callback', callback);
        serverLog('Spotfiy module ready!');
        resolve();
    });
};

var callback = (req, res) => {
    var code = req.query.code;
    var state = req.query.state;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
};

module.exports.niceName = function() {
    return 'Spotfiy controls';
};

module.exports.getSettings = () => {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/settings.pug`));
};

module.exports.getMainView = () => {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/player.pug`));
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
            if(err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

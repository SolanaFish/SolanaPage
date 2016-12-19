let settingsDir = "./modules/google-calendar-module/settings.json";
let authDir = "./modules/google-calendar-module/oauth.json";
let credentialsDir = "./modules/google-calendar-module/credentials.json";
const fs = require("fs");
const pug = require('pug');
const bodyParser = require('body-parser'); // Basic parser (no multipart support)
const uep = bodyParser.urlencoded({
    extended: false
});
const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
const google = require('googleapis');
const googleAuth = require('google-auth-library');

function serverLog(text) {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
}

var settings = {
    load: () => {
        if (fs.existsSync(settingsDir)) {
            settings.current = JSON.parse(fs.readFileSync(settingsDir));
        }
        if (fs.existsSync(authDir)) {
            authorize(JSON.parse(fs.readFileSync(authDir)));
        } else {
            serverLog("Couldn't find auth file!");
        }
    },
    current: {},
    loggedIn: false,
    needsToken: false,
    oauth2Client: null,
    events: [],
    save: () => {
        serverLog('Saving bookmarks settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

var authorize = (credentials) => {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    settings.oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(credentialsDir, (err, token) => {
        if (err) {
            settings.needsToken = true;
        } else {
            settings.loggedIn = true;
            settings.oauth2Client.credentials = JSON.parse(token);
            listEvents();
        }
    });
};

var getNewToken = (req, res) => {
    var code = req.query.code;
    settings.oauth2Client.getToken(code, (err, token)=> {
        if(err) {
            console.log("Error while trying to retrive access token", err);
            res.sendStatus(401);
            return;
        } else {
            settings.needsToken = false;
            settings.loggedIn = true;
            settings.oauth2Client.credentials = token;
            storeToken(token);
            listEvents();
            res.sendStatus(200);
        }
    });
};

var getNewTokenLink = () => {
    return settings.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
};

var storeToken = (token) => {
    fs.writeFile(credentialsDir, JSON.stringify(token));
};

var listEvents = () => {
    var calendar = google.calendar('v3');
    calendar.events.list({
        auth: settings.oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, (err, res) => {
        if (err) {
            serverLog('Calendar api returned an error');
            console.log(err);
        } else {
            var events = res.items;
            console.log(events);
        }
    });
};

module.exports = function(app) {
    return new Promise(function(resolve, reject) {
        settings.load();
        app.get('/calendar/callback', uep ,getNewToken);
        serverLog("Google-calendar module ready!");
        resolve();
    });
};

module.exports.getSettings = function() {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/settings.pug`, {
        settings: settings.current
    }));
};

module.exports.getMainView = function() {
    if (settings.loggedIn) {
        console.log('loged');
        return Promise.resolve(pug.renderFile(`${__dirname}/../views/upcoming.pug`, {
            settings: settings.current
        }));
    } else {
        if(settings.needsToken) {
            console.log('token');
            return Promise.resolve(pug.renderFile(`${__dirname}/../views/login.pug`, {
                settings: settings.current,
                tokenUrl: getNewTokenLink()
            }));
        } else {
            console.log('nil');
            return null;
        }
    }
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
    return 'Google calendar module';
};

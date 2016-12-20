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
    current: {
        refresh: 10,
        events: 10,
        display: [{
            name: 'status',
            active: false
        }, {
            name: 'date',
            active: true
        }, {
            name: 'description',
            active: true
        }, {
            name: 'location',
            active: true
        }, {
            name: 'reminders',
            active: false
        }, {
            name: 'attachments',
            active: true
        }]
    },
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

module.exports = function(app) {
    return new Promise(function(resolve, reject) {
        settings.load();
        app.get('/calendar/callback', uep, getNewToken);
        app.post('/calendar/submitCalendarEvents', uep, submitCalendarEvents);
        app.post('/calendar/submitCalendarRefresh', uep, submitCalendarRefresh);
        setInterval(() => {
            listEvents();
        }, settings.current.refresh * 60 * 1000);
        serverLog("Google-calendar module ready!");
        resolve();
    });
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
            settings.oauth2Client.refreshAccessToken((err, tokens) => {
                if (!err) {
                    storeToken(tokens);
                } else console.log(err);
                listEvents();
            });
        }
    });
};

var getNewToken = (req, res) => {
    var code = req.query.code;
    settings.oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.log("Error while trying to retrive access token", err);
            res.sendStatus(400);
            return;
        } else {
            settings.needsToken = false;
            settings.loggedIn = true;
            settings.oauth2Client.credentials = token;
            storeToken(token);
            listEvents();
            res.redirect('/');
        }
    });
};

var getNewTokenLink = () => {
    return settings.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        approval_prompt: 'force',
        scope: scopes
    });
};

var storeToken = (token) => {
    fs.writeFile(credentialsDir, JSON.stringify(token), () => {});
};

var listEvents = () => {
    var calendar = google.calendar('v3');
    settings.oauth2Client.refreshAccessToken((err, tokens) => {
        if (!err) {
            storeToken(tokens);
        } else {
            console.log(err);
        }
        calendar.events.list({
            auth: settings.oauth2Client,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: settings.current.events,
            singleEvents: true,
            orderBy: 'startTime'
        }, (err, res) => {
            if (err) {
                serverLog('Calendar api returned an error');
                console.log(err);
            } else {
                settings.events = res.items;
                settings.events.forEach((event) => {
                    var today = new Date();
                    var date;
                    event.niceDate = {};
                    if (event.start.date) {
                        date = new Date(event.start.date);
                        if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) {
                            event.niceDate.start = 'Today';
                        } else if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() + 1) {
                            event.niceDate.start = 'Tomorrow';
                        } else {
                            event.niceDate.start = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
                        }
                    } else if (event.start.dateTime) {
                        date = new Date(event.start.dateTime);
                        if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) {
                            event.niceDate.start = `Today at ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
                        } else if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() + 1) {
                            event.niceDate.start = `Tomorrow at ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
                        } else {
                            event.niceDate.start = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} at ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
                        }
                    }
                    if (event.end.date) {
                        date = new Date(event.end.date);
                        if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) {
                            event.niceDate.end = 'Today';
                        } else if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() + 1) {
                            event.niceDate.end = 'Tomorrow';
                        } else {
                            event.niceDate.end = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
                        }
                    } else if (event.end.dateTime) {
                        date = new Date(event.end.dateTime);
                        if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) {
                            event.niceDate.end = `Today at ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
                        } else if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() + 1) {
                            event.niceDate.end = `Tomorrow at ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
                        } else {
                            event.niceDate.end = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} at ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
                        }
                    }
                });
            }
        });
    });
};

var submitCalendarEvents = (req, res) => {
    var events = parseInt(req.body.events);
    if (events > 0 && events < 180) {
        settings.current.events = events;
        settings.save();
        listEvents();
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
};

var submitCalendarRefresh = (req, res) => {
    var refresh = parseInt(req.body.refresh);
    if (refresh > 0 && refresh < 180) {
        settings.current.refresh = refresh;
        settings.save();
        listEvents();
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
};

module.exports.getSettings = function() {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/settings.pug`, {
        settings: settings.current
    }));
};

module.exports.getMainView = function() {
    if (settings.loggedIn) {
        return Promise.resolve(pug.renderFile(`${__dirname}/../views/upcoming.pug`, {
            settings: settings.current,
            events: settings.events
        }));
    } else {
        if (settings.needsToken) {
            return Promise.resolve(pug.renderFile(`${__dirname}/../views/login.pug`, {
                settings: settings.current,
                tokenUrl: getNewTokenLink()
            }));
        } else {
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

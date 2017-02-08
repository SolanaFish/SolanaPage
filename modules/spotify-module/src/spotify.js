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
const redirectUrl = 'http://localhost:8081/spotify/callback';

/* pls don't use this module until https://github.com/spotify/web-api/issues/12 gets resolved  */

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
        id: '',
        secret: ''
    },
    user: {
        access_token: '',
        refresh_token: ''
    },
    save: () => {
        serverLog('Saving reddit settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

var serverLog = (text) => {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
};

var generateRandomString = (length) => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; ++i) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};


module.exports = (app) => {
    return new Promise((resolve, reject) => {
        settings.load();
        app.use(cookieParser());
        app.get('/spotify/callback', callback);
        app.get('/spotify/login', login);
        app.get('/spotify/refresh', refreshToken);
        serverLog('Spotfiy module ready!');
        resolve();
    });
};

var userInfo = {
    update: () => {
        if (settings.user.access_token !== '') {
            request.get({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + settings.user.access_token
                },
                json: true
            }, (err, resp, body) => {
                userInfo.name = body.display_name;
            });
            request.get({
                url: 'https://api.spotify.com/v1/me/playlists',
                headers: {
                    'Authorization': 'Bearer ' + settings.user.access_token
                },
                json: true
            }, (err, resp, body) => {
                body.items.forEach((playlist) => {
                    request.get({
                        url: playlist.tracks.href,
                        headers: {
                            'Authorization': 'Bearer ' + settings.user.access_token
                        },
                        json: true
                    }, (err, resp, body) => {
                        if (!err) {
                            var tracks = [];
                            body.items.forEach((track) => {
                                if (track.track.album.artists[0]) {
                                    tracks.push({
                                        title: track.track.name,
                                        artist: track.track.artists[0].name
                                    });
                                } else {
                                    tracks.push({
                                        title: track.track.name,
                                        artist: 'No information'
                                    });
                                }
                            });
                            userInfo.playLists.push({
                                href: playlist.href,
                                name: playlist.name,
                                tracks: tracks
                            });
                        }
                    });
                });
                userInfo.id = body.id;
            });
        }
    },
    name: '',
    id: '',
    playLists: []
};
var login = (req, res) => {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: settings.credentials.id,
            scope: scope,
            redirect_uri: redirectUrl,
            state: state
        })
    );
};

var callback = (req, res) => {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/');
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: 'http://localhost:8081/spotify/callback',
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(settings.credentials.id + ':' + settings.credentials.secret).toString('base64'))
            },
            json: true
        };
        request.post(authOptions, (err, resp, body) => {
            if (!err && resp.statusCode === 200) {
                settings.user.access_token = body.access_token;
                settings.user.refresh_token = body.refresh_token;
                userInfo.update();
                res.redirect('/');
            } else {
                console.log('invalid token');
                res.redirect('/');
            }
        });
    }
};

var refreshToken = (req, res) => {
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(settings.credentials.id + ':' + settings.credentials.secret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, (err, res, body) => {
        var access_token = body.access_token;
        res.send({
            'access_token': access_token
        });
    });
};

module.exports.niceName = () => {
    return 'Spotfiy controls';
};

module.exports.getSettings = () => {
    return null;
};

module.exports.getMainView = () => {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/player.pug`, {
        settings: settings,
        info: userInfo
    }));
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

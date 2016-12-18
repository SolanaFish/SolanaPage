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

function serverLog(text) {
    var date = new Date();
    console.log(`[ ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)} ] ${text}`);
}

function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; ++i) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


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

                // var options = {
                //     url: 'https://api.spotify.com/v1/me',
                //     headers: {
                //         'Authorization': 'Bearer ' + access_token
                //     },
                //     json: true
                // };
                // request.get(options, (err, resp, body) => {
                //     console.log(body);
                //     console.log('good token');
                //     console.log(access_token);
                //     console.log(refresh_token);
                //     res.redirect('/');
                // });
            } else {
                console.log('invalid token');
                console.log(resp.statusCode === 200);
                console.log(resp.body);
                console.log(!err);
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
        console.log('refreshed');
        console.log(access_token);
        res.send({
            'access_token': access_token
        });
    });
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
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

let settingsDir = "./modules/google-calendar-module/settings.json";
const fs = require("fs");
const pug = require('pug');
const bodyParser = require('body-parser'); // Basic parser (no multipart support)
const uep = bodyParser.urlencoded({
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
        bookmarks: {
            categories: [{
                name: "MainCategory",
                bookmarks: [{
                    name: "repo",
                    url: "https://github.com/SolanaFish/SolanaPage"
                }]
            }]
        },
        view: 'items',
        colorfulItems: false
    },
    save: () => {
        serverLog('Saving bookmarks settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

module.exports = function(app) {
    return new Promise(function(resolve, reject) {
        settings.load();

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
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/upcoming.pug`, {
        settings: settings.current
    }));
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

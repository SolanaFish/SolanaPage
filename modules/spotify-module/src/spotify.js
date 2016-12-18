let settingsDir = "./modules/spotify-module/settings.json";
const fs = require('fs');
const bodyParser = require('body-parser');
const pug = require('pug');
const uep = bodyParser.urlencoded({
    extended: false
});

var settings = {
    load: () => {
        if (fs.existsSync(settingsDir)) {
            settings.current = JSON.parse(fs.readFileSync(settingsDir));
        }
    },
    current: {

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

module.exports.niceName = () => {
    return 'Spotfiy module';
};

module.exports = (app) => {
    return new Promise((resolve, reject) => {
        settings.load();
        serverLog('Spotfiy module ready!');
    });
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

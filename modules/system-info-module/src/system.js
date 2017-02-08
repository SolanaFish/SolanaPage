const settingsDir = __dirname + "/../settings.json";
var os = require('os'); // for uptime
var fs = require("fs"); // for reading settings
var pug = require('pug');

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
        elements: [{
            name: "uptime",
            active: true
        }, {
            name: "memory",
            active: true
        }, {
            name: "loadAverage",
            active: true
        }]
    },
    save: () => {
        serverLog('Saving reddit settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

module.exports = (app) => {
    return new Promise((resolve, reject) => {
        serverLog("System info module ready!");
        settings.load();
        resolve();
    });
};

module.exports.getSettings = () => {
    return null;
};

module.exports.getMainView = () => {
    var uptime = {
        days: Math.floor((os.uptime() / 86400) % 86400),
        hours: Math.floor((os.uptime() / 3600) % 3600),
        minutes: Math.floor((os.uptime() / 60) % 60)
    };
    return pug.renderFile(`${__dirname}/../views/systemInfo.pug`, {
        "os": os,
        "settings": settings,
        "uptime": uptime
    });
};

module.exports.getScript = () => {
    return null;
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
    return 'System information';
};

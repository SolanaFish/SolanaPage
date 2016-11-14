const settingsDir = "./modules/reddit-wallpapers-module/settings.json";
var fs = require('fs');
var fetch = require('node-fetch');
var settings = {
    load: () => {
        if (fs.existsSync(settingsDir)) {
            settings.current = JSON.parse(fs.readFileSync(settingsDir));
        }
    },
    current: {
        subreddits: ["EarthPorn"]
    }
};
var readyUrls = [];

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function getRandomWallpaperURL() {
    return readyUrls[Math.floor(Math.random() * readyUrls.length)];
}

function updateUrls() {
    fetchURLs().then((value) => {
        readyUrls = value;
    }).catch((err) => {
        serverLog(err);
    });
}

function fetchURLs() {
    return new Promise((resolve, reject) => {
        var subredditPromises = [];
        settings.current.subreddits.forEach((subreddit) => {
            subredditPromises.push(getUrlsFromSubreddit(subreddit));
        });
        Promise.all(subredditPromises).then((value) => {
            var urls = [];
            value.forEach((promiseValue) => {
                urls = urls.concat(promiseValue);
            });
            resolve(urls);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getUrlsFromSubreddit(subreddit) {
    return new Promise((resolve, reject) => {
        fetch(`https://reddit.com/r/${subreddit}.json`).then((res) => {
            return res.json();
        }).then((json) => {
            var urls = [];
            json.data.children.forEach((element) => {
                var url = element.data.url.replace(/&amp;/g,"&"); // This is a hotfix for broken reddit api 
                urls.push(url);
            });
            resolve(urls);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = (app) => {
    app.get('/reddit-wallpapers-module/script.js', scriptJS);
    updateUrls();
    setInterval(updateUrls, 5 * 60 * 1000);
    app.get('/randomWallpaper', (req, res) => {
        res.send(getRandomWallpaperURL());
    });
    serverLog('Reddit wallpaper module ready!');
};

var scriptJS = (req, res) => {
    res.sendFile(`${__dirname}/script.js`);
};

module.exports.getSettings = () => {
    return null;
};

module.exports.getMainView = () => {
    return null;
};

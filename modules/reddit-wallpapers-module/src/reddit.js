const settingsDir = "./modules/reddit-wallpapers-module/settings.json";
const fs = require('fs');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
var readyUrls = [];
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
        subreddits: ["EarthPorn"],
        refresh: 120,
        links: 50
    },
    save: () => {
        serverLog('Saving reddit settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function getRandomWallpaper() {
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
        fetch(`https://reddit.com/r/${subreddit}.json?limit=${settings.links}`).then((res) => {
            return res.json();
        }).then((json) => {
            var urls = [];
            json.data.children.forEach((element) => {
                var url = element.data.url.replace(/&amp;/g, "&"); // This is a hotfix for broken reddit api
                var permalink = element.data.permalink;
                var subreddit = element.data.subreddit;
                var title = element.data.title;
                urls.push({
                    url,
                    permalink,
                    subreddit,
                    title
                });
            });
            resolve(urls);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = (app) => {
    settings.load();

    updateUrls();
    setInterval(updateUrls, settings.current.refresh * 60 * 1000);

    app.get('/randomWallpaper', randomWall);
    app.get('/reddit-wallpapers-module/script.js', scriptJS);
    app.post('/redditWallpaper/setRefresh', uep, setRefresh);
    app.post('/redditWallpaper/setSubreddits', uep, setSubreddits);
    app.post('/redditWallpaper/setLinks',uep, setLinks);

    serverLog('Reddit wallpaper module ready!');
};

var randomWall = (req, res) => {
    var wall = getRandomWallpaper();
    var info = pug.renderFile(`${__dirname}/../views/info.pug`, {
        wall: wall
    });
    res.send({
        wallUrl: wall.url,
        info: info
    });
};

var scriptJS = (req, res) => {
    res.sendFile(`${__dirname}/script.js`);
};

var setRefresh = (req, res) => {
    const refresh = req.body.refresh;
    if (refresh != settings.current.refresh) {
        settings.current.refresh = refresh;
        settings.save();
    }
    res.sendStatus(200);
};

var setLinks = (req, res) => {
    const links = req.body.links;
    if (links != settings.current.links) {
        settings.current.links = links;
        settings.save();
    }
    res.sendStatus(200);
};

var setSubreddits = (req, res) => {
    settings.current.subreddits = JSON.parse(req.body.subs);
    settings.save();
    res.sendStatus(200);
};

module.exports.getSettings = () => {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/settings.pug`, {
        settings: settings.current
    }));
};

module.exports.getMainView = () => {
    return null;
};

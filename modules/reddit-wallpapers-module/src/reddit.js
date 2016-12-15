let settingsDir = "./modules/reddit-wallpapers-module/settings.json";
const fs = require('fs');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
var readyUrls = [];
const pug = require('pug');
const nodeFetchSync = require('sync-request');

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
        links: 50,
        checkUrls: false
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

function getRandomWallpaper() {
    return readyUrls[Math.floor(Math.random() * readyUrls.length)];
}

function updateUrls() {
    return new Promise((resolve, reject) => {
        fetchURLs().then((value) => {
            readyUrls = value;
            resolve('Fetched ' + readyUrls.length + ' new wallpapers');
        }).catch((err) => {
            serverLog(err);
            reject('Error fetching urls');
        });
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

                // If checking urls is active then try to fetch wallpaper from source
                if (settings.current.checkUrls) {
                    var res;
                    try {
                        res = nodeFetchSync('GET', url, {
                            timeout: 500
                        });
                    } catch (e) {} finally {
                        if (res && res.statusCode != 404) { // If 404 skip adding this wallpaper
                            urls.push({
                                url,
                                permalink,
                                subreddit,
                                title
                            });
                        }
                    }
                } else {
                    urls.push({
                        url,
                        permalink,
                        subreddit,
                        title
                    });
                }

            });
            resolve(urls);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = (app) => {
    return new Promise(function(resolve, reject) {
        serverLog('Loading reddit wallpaper module!');
        settings.load();

        app.get('/randomWallpaper', randomWall);
        app.post('/redditWallpaper/setRefresh', uep, setRefresh);
        app.post('/redditWallpaper/setSubreddits', uep, setSubreddits);
        app.post('/redditWallpaper/setLinks', uep, setLinks);
        app.post('/redditWallpaper/checkUrls', uep, checkUrls);

        setInterval(updateUrls, settings.current.refresh * 60 * 1000);
        updateUrls().then((value) => {
            serverLog(value);
            serverLog('Reddit wallpaper module ready!');
            resolve();
        }).catch((err) => {
            serverLog(err);
            reject(err);
        });
    });

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


var setRefresh = (req, res) => {
    const refresh = parseInt(req.body.refresh);
    if (refresh != settings.current.refresh) {
        settings.current.refresh = refresh;
        settings.save();
    }
    res.sendStatus(200);
};

var setLinks = (req, res) => {
    const links = parseInt(req.body.links);
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

var checkUrls = (req, res) => {
    if (req.body.checked == 'true') {
        settings.current.checkUrls = true;
    } else {
        settings.current.checkUrls = false;
    }
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
    return 'Reddit backgrounds';
};

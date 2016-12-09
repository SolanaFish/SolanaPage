let settingsDir = "./modules/bookmarks-module/settings.json";
const fs = require("fs"); // for saving thumbnails
const webshot = require('webshot'); // for rendering webside
const gm = require('gm'); // resizing thumbnails
const pug = require('pug');
const shortid = require('shortid');
const bodyParser = require('body-parser'); // Basic parser (no multipart support)
const uep = bodyParser.urlencoded({
    extended: false
});

function serverLog(text) {
    var date = new Date();
    console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
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
        }
    },
    save: () => {
        serverLog('Saving bookmarks settings to local file');
        var stringified = JSON.stringify(settings.current, null, 4);
        fs.writeFileSync(settingsDir, stringified);
    },
};

function findCategory(name) {
    return settings.current.bookmarks.categories.indexOf(settings.current.bookmarks.categories.filter((value) => { // category exists
        return value.name == name;
    })[0]);
}

function findBookmark(url, category) {
    return settings.current.bookmarks.categories[category].bookmarks.indexOf(settings.current.bookmarks.categories[category].bookmarks.filter((value) => { // that url exists
        return value.url == url;
    })[0]);
}

module.exports = function(app) {
    return new Promise(function(resolve, reject) {
        settings.load();

        app.post('/bookmarks/addBookmark', uep, addBookmark);
        app.post('/bookmarks/deleteBookmark', uep, deleteBookmark);
        app.post('/bookmarks/deleteCategory', uep, deleteCategory);
        app.post('/bookmarks/addNewCategory', uep, addCategory);
        serverLog("Bookmarks module ready!");
        resolve();
    });
};

var addBookmark = function(req, res) {
    var name = req.body.bookmarkName;
    var link = req.body.bookmarkLink;
    var category = req.body.category;
    if (name !== "" && link !== "" && category !== "") {
        var categoryIndex = findCategory(category);
        if (categoryIndex != -1) {
            if (findBookmark(link, categoryIndex) != -1) {
                res.sendStatus(501);
            } else {
                var newBookmark = {
                    name: name,
                    url: link,
                    thumbnail: `${shortid.generate()}.png`
                };
                settings.current.bookmarks.categories[categoryIndex].bookmarks.push(newBookmark);
                settings.save();
                webshot(newBookmark.url, 'temp.png', (err) => {
                    if (err) {
                        res.sendStatus(501);
                    } else {
                        gm('temp.png').thumb(300, 200, `thumbnails/${newBookmark.thumbnail}`, 80, (err) => {
                            fs.unlink('temp.png', () => {
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(501);
                                } else {
                                    res.sendStatus(200);
                                }
                            });
                        });
                    }
                });
            }
        } else {
            res.sendStatus(501);
        }
    } else {
        res.sendStatus(501);
    }
};

var deleteBookmark = function(req, res) {
    var bookmark = req.body.url;
    var category = req.body.category;

    var foundCategory = findCategory(category);

    if (foundCategory != -1) {
        var foundBookmark = findBookmark(bookmark, foundCategory);
        if (foundBookmark != -1) {
            var delBookmark = settings.current.bookmarks.categories[foundCategory].bookmarks[foundBookmark];
            fs.unlink(`./thumbnails/${delBookmark.thumbnail}`, (err) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(501);
                } else {
                    settings.current.bookmarks.categories[foundCategory].bookmarks.splice(foundBookmark, 1);
                    settings.save();
                    res.sendStatus(200);
                }
            });
        }
    }
};

var deleteCategory = function(req, res) {
    var category = req.body.name;
    var foundCategory = findCategory(category);
    if (foundCategory != -1) {
        var delCategory = settings.current.bookmarks.categories[foundCategory];
        if(delCategory.length > 0) {
            delCategory.forEach((bookmark) => {
                fs.unlink(`./thumbnails/${delBookmark.thumbnail}`, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        }
        settings.current.bookmarks.categories.splice(foundCategory, 1);
        settings.save();
        res.sendStatus(200);
    } else {
        res.sendStatus(501);
    }
};

var addCategory = function(req, res) {
    var categoryName = req.body.name;
    if (findCategory(categoryName) == -1) {
        var newCategory = {
            name: categoryName,
            bookmarks: []
        };
        settings.current.bookmarks.categories.push(newCategory);
        settings.save();
        res.sendStatus(200);
    } else {
        res.sendStatus(501);
    }
};

var scriptJS = function(req, res) {
    res.sendFile(__dirname + "/script.js");
};

module.exports.getSettings = function() {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/bookmarksSettings.pug`, settings.current));
};

module.exports.getMainView = function() {
    if (settings.current.bookmarks.categories.length == 1) {
        return Promise.resolve(pug.renderFile(`${__dirname}/../views/nocategories.pug`, {
            bookmarks: settings.current.bookmarks
        }));
    } else {
        return Promise.resolve(pug.renderFile(`${__dirname}/../views/categories.pug`, {
            bookmarks: settings.current.bookmarks
        }));
    }
};

module.exports.getScript = function() {
    return new Promise(function(resolve, reject) {
        fs.readFile(`${__dirname}/script.js`, (err, data) => {
            if(err) {
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
            if(err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
};

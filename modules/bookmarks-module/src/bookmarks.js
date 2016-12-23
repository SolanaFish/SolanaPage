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
        app.post('/bookmarks/displayMethod', uep, displayMethod);
        app.post('/bookmarks/colorfulItems', uep, colorfulItems);
        app.post('/bookmarks/reorderCategories', uep, reorderCategories);
        app.post('/bookmarks/reorderBookmarks', uep, reorderBookmarks);
        serverLog("Bookmarks module ready!");
        resolve();
    });
};

var addBookmark = function(req, res) {
    var name = req.body.bookmarkName;
    var link = req.body.bookmarkLink;
    var category = req.body.category;
    var color = req.body.color;
    var text = req.body.text;

    if (name !== "" && link !== "" && category !== "") {
        var categoryIndex = findCategory(category);
        if (categoryIndex != -1) {
            if (findBookmark(link, categoryIndex) != -1) {
                console.log("Bookmark already exists");
                res.sendStatus(403);
            } else {
                var newBookmark = {
                    name: name,
                    url: link,
                    thumbnail: `${shortid.generate()}.png`
                };
                if (typeof color !== 'undefined') {
                    newBookmark.color = {};
                    newBookmark.color.background = color;
                    newBookmark.color.text = text;
                }
                settings.current.bookmarks.categories[categoryIndex].bookmarks.push(newBookmark);
                settings.save();
                // Generating thumbnail
                webshot(newBookmark.url, 'temp.png', {
                    phantomConfig: {
                        'ssl-protocol': 'any',
                        'ignore-ssl-errors': 'true'
                    },
                    renderDelay: 1000
                }, (err) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    } else {
                        gm('temp.png').thumb(300, 200, `thumbnails/${newBookmark.thumbnail}`, 80, (err) => {
                            fs.unlink('temp.png', () => {
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                } else {
                                    res.sendStatus(200);
                                }
                            });
                        });
                    }
                });
            }
        } else {
            console.log('No category');
            res.sendStatus(400);
        }
    } else {
        console.log('Invalid data');
        res.sendStatus(400);
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
            fs.unlink(`${__dirname}/../../../thumbnails/${delBookmark.thumbnail}`, (err) => {
                if (err) {
                    console.log(err);
                }
                settings.current.bookmarks.categories[foundCategory].bookmarks.splice(foundBookmark, 1);
                settings.save();
                res.sendStatus(200);
            });
        } else {
            console.log('Bookmark does not exist');
            res.sendStatus(400);
        }
    } else {
        console.log('Category does not exist');
        res.sendStatus(400);
    }
};

var deleteCategory = function(req, res) {
    var category = req.body.name;

    var foundCategory = findCategory(category);

    if (foundCategory != -1) {
        var delCategory = settings.current.bookmarks.categories[foundCategory];
        // If the are bookmarks in this category clear their thumbnails
        if (delCategory.length > 0) {
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
        res.sendStatus(400);
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
        res.sendStatus(400);
    }
};

var displayMethod = function(req, res) {
    var method = req.body.method;

    if (method === 'items' || method === 'cards') {
        settings.current.view = method;
        settings.save();
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
};

var colorfulItems = function(req, res) {
    var method = JSON.parse(req.body.colorful);

    if (typeof method === 'boolean') {
        settings.current.colorfulItems = method;
        settings.save();
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
};

var reorderCategories = (req, res) => {
    var newOrder = JSON.parse(req.body.data);
    var newSettings = [];
    newOrder.forEach((item, index) => {
        newSettings.push(settings.current.bookmarks.categories[item.orginalPosition]);
    });
    settings.current.bookmarks.categories = newSettings;
    settings.save();
    res.sendStatus(200);
};

var reorderBookmarks = (req, res) => {
    var newOrder = JSON.parse(req.body.data);
    var newSettings = [];
    newOrder.forEach((category, categoryIndex) => {
        var newCategory = {
            name: settings.current.bookmarks.categories[categoryIndex].name,
            bookmarks: []
        };
        category.forEach((orginalPosition) => {
            newCategory.bookmarks.push(settings.current.bookmarks.categories[categoryIndex].bookmarks[orginalPosition]);
        });
        newSettings.push(newCategory);
    });
    settings.current.bookmarks.categories = newSettings;
    settings.save();
    res.sendStatus(200);
};

module.exports.getSettings = function() {
    return Promise.resolve(pug.renderFile(`${__dirname}/../views/bookmarksSettings.pug`, settings.current));
};

module.exports.getMainView = function() {
    if (settings.current.view === "cards") {
        return Promise.resolve(pug.renderFile(`${__dirname}/../views/categories.pug`, {
            bookmarks: settings.current.bookmarks
        }));
    } else if (settings.current.view === "items") {
        return Promise.resolve(pug.renderFile(`${__dirname}/../views/items.pug`, {
            settings: settings.current,
            bookmarks: settings.current.bookmarks
        }));
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
    return 'Bookmarks store';
};

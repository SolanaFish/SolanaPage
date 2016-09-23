const settingsDir = "./modules/bookmarks-module/settings.json";
var fs = require("fs"); // for saving thumbnails
var webshot = require('webshot'); // for rendering webside
var gm = require('gm');  // resizing thumbnails
var bodyParser = require('body-parser'); // Basic parser (no multipart support)
var uep = bodyParser.urlencoded({ extended: false })
var settings = readSettings();

function serverLog(text) {
	var date = new Date();
	console.log("[ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ] " + text);
}

function readSettings() {
	if(fs.existsSync(settingsDir)) {
		var settingsFile = fs.readFileSync(settingsDir);
		return JSON.parse(settingsFile);
	} else {
		var newSettings = {
			"bookmarks": {
				"categories": [
					{
						"name": "def",
						"bookmarks": [
							{
								"name": "repo",
								"url": "https://github.com/SolanaFish/SolanaPage"
							}
						]
					}
				]
			}
		}
		var settingsString = JSON.stringify(newSettings, null, "	");
		fs.writeFileSync(settingsDir, settingsString)
		return newSettings
	}
}

function saveSettings() {
	var settingsString = JSON.stringify(settings, null, "	");
	fs.writeFileSync(settingsDir, settingsString);
	settings = readSettings();
}

function findCategory(category) {
	for(var cat in settings.bookmarks.categories) {
		if (settings.bookmarks.categories[cat].name == category) {
			return cat;
		}
	}
}

function findBookmark(name, foundCategory) {
	for (var bookmark in settings.bookmarks.categories[foundCategory].bookmarks) {
		if (settings.bookmarks.categories[foundCategory].bookmarks[bookmark].name == name) {
			return bookmark
		}
	}
}

module.exports = function (app) {
	app.get('/bookmarks/mainView', module.exports.mainView)
	app.get('/bookmarks/deleteView',module.exports.deleteView)
	app.get('/bookmarks/menuView', uep, module.exports.menuView)
	app.get('/bookmarks-module/script.js', module.exports.scriptJS)

	app.post('/bookmarks/addBookmark', uep, module.exports.addBookmark)
	app.post('/bookmarks/deleteBookmark', uep, module.exports.deleteBookmark)
	app.post('/bookmarks/deleteCategory', uep, module.exports.deleteCategory)
	app.post('/bookmarks/addNewCategory', uep, module.exports.addCategory)
	serverLog("Bookmarks module ready!")
}

module.exports.mainView = function (req, res) {
	serverLog("Serving bookmarks view");
	if(settings.bookmarks.categories.length == 1) {
		res.render('nocategories', { bookmarks: settings.bookmarks});
	} else {
		res.render('categories', { bookmarks: settings.bookmarks});
	}
}

module.exports.deleteView = function(req, res) {
	serverLog("Serving delete bookmarks view");

	res.render('deleteBookmarks', { bookmarks: settings.bookmarks });
}

module.exports.menuView = function(req,res) {
	res.render('addBookmarkMenu', { bookmarks: settings.bookmarks})
}

module.exports.addBookmark = function(req, res) { //TODO: use id for names
	var name = req.body.bookmarkName;
	var link = req.body.bookmarkLink;
	var category = req.body.category;
	if (name != "" && link != "" && category != "") {

		serverLog("Adding bookmark to: " + link + " , as " + name + " in " + category + " category");

		var newBookmark = {name: name, url: link};
		var foundCategory = findCategory(category); //TODO: THROW
		for (bookmark in settings.bookmarks.categories[foundCategory].bookmarks) {
			if (settings.bookmarks.categories[foundCategory].bookmarks[bookmark].name == name) {
				res.sendStatus(300);
				return
			}
		}
		settings.bookmarks.categories[foundCategory].bookmarks.push(newBookmark)
		saveSettings();

		var thumbnailDirectory = './thumbnails/' + name + '.png';
		webshot(link, thumbnailDirectory, function(err) {
		  	if(err != null) {
		  		console.log(err);
		  	}
		  	// TODO: try not to read and write same file
		 	gm(thumbnailDirectory).thumb(300, 200, thumbnailDirectory, 100, function(err, stdout, stderr, command){
				if(err != null) console.log(err);
			})
		})
	}
	res.sendStatus(200);
}

module.exports.deleteBookmark = function(req,res) { // TODO: delete old thumbnail
	var bookmark = req.body.name;
	var category = req.body.category;

	var foundCategory = findCategory(category);
	var foundBookmark = findBookmark(bookmark, foundCategory);

	if (foundBookmark >= 0) {
		serverLog("Deleting bookmark number: " + foundBookmark + " from category: " + category);

		if(foundCategory != null) { // TODO:throw
			settings.bookmarks.categories[foundCategory].bookmarks.splice(foundBookmark,1);
			saveSettings();
		}

	}
	res.redirect('back');
}

module.exports.deleteCategory = function(req, res) {
	var categoryName = req.body.name;
	serverLog("Deleting category: " + categoryName);
	var foundCategory = findCategory(categoryName);
	if(foundCategory != null) { // TODO: throw
		settings.bookmarks.categories.splice(foundCategory, 1);
		saveSettings();
	}
}

module.exports.addCategory = function(req,res) {
	var categoryName = req.body.name;
	if(findCategory(categoryName) == null) {
		serverLog("Adding category: " + categoryName);
		var newCategory = {"name":categoryName, "bookmarks": []}
		settings.bookmarks.categories.push(newCategory);
		saveSettings();
		res.sendStatus(200);
	}
}

module.exports.scriptJS = function(req, res) {
	res.sendFile(__dirname + "/script.js")
}

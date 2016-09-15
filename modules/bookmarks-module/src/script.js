function bookmarks() {
	fetch ('/bookmarks/mainView').then(function(res) {
		return res.text();
	}).then(function(res) {
		document.querySelector("#bookmarks-module").innerHTML = res;
		var template = document.querySelector("#bookmarksTemplate");
		template.page = 0;
	}).catch(console.error)
}

function delBookmarks() {
	fetch ('/bookmarks/deleteView').then(function(res) {
		return res.text();
	}).then(function(res) {
		document.querySelector("#bookmarks").innerHTML = res;
		var template = document.querySelector("#bookmarksTemplate");
		template.page = 0;
	}).catch(console.error)
}

function addBookmark() {
	var template = document.querySelector("#addBookmark");
	if (template.category.value == "newCategory") {
		addNewCategoryDialog.open()
	} else {
		if (template.category.value == "") {
			noCategoryToast.open();
		} else {
			submitForm('addBookmark');
			bookmarks();
		}
	}
}

function sendNewCategory(categoryName) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/bookmarks/addNewCategory", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("name=" + categoryName);
	var addBookmark = document.querySelector("#addBookmark");
	addBookmark.category.value = categoryName;
	xhttp.onreadystatechange = function() {
		console.log(this.status);
		if (this.readyState == 4 && this.status == 200) {
			submitForm('addBookmark');
		}
	}
}

function deleteCategory(categoryName) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/bookmarks/deleteCategory", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("name=" + categoryName);
	delBookmarks();
}

var deleteBookmarksMode = false;

function deleteBookmarks() { // TODO: deCANCER the animation
	document.querySelector("#bookmarksColapse").toggle()

	sleep(500).then(() => {
		if (!deleteBookmarksMode) {
			delBookmarks();
			deleteBookmarksMode = true;
		} else {
			deleteBookmarksMode = false;
			bookmarks();
		}
		sleep(300).then(() => {
			if (deleteBookmarksMode) {
				document.querySelector("#bookmarksColapse").toggle()
			}
		})
	})
}

function deleteBookmark(name, category) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/bookmarks/deleteBookmark", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("name=" + name + "&category=" + category);
	delBookmarks();
}

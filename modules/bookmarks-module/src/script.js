function addBookmark() {
    var template = document.querySelector("#addBookmarkTemplate");
    if (template.category == "newCategory") {
        addNewCategoryDialog.open();
    } else {
        if (template.category === "") {
            noCategoryToast.open();
        } else {
            template.$.addBookmarkForm.submit();
        }
    }
}

function sendNewCategory(categoryName) {
    var xhttp = new XMLHttpRequest();
    var addBookmark = document.querySelector("#addBookmark");
    addBookmark.category.value = categoryName;
    xhttp.open("POST", "/bookmarks/addNewCategory", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + categoryName);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            submitForm('addBookmark');
        }
    };
}

function deleteCategory(categoryName) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/deleteCategory", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + categoryName);
    delBookmarks();
}

function deleteBookmark(name, category) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/deleteBookmark", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("url=" + name + "&category=" + category);
    delBookmarks();
}

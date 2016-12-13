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

function addBookmarkWithNewCategory() {
    var newCategory = document.getElementById('newCategory');
    sendNewCategory(newCategory.value).then(() => {
        var template = document.querySelector("#addBookmarkTemplate");
        template.category = newCategory.value;
        template.$.addBookmarkForm.submit();
    }).catch((err)=> {
        if(err) {
            document.getElementById('errorCategoryToast').open();
        }
    });
}

function sendNewCategory(categoryName) {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/bookmarks/addNewCategory", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("name=" + categoryName);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(200);
            }
        };
    });
}

function deleteCategory(categoryName) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/deleteCategory", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + categoryName);
}

function deleteBookmark(name, category) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/deleteBookmark", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("url=" + name + "&category=" + category);
}

function copyToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.style.postition = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
    } finally {
    }
    document.body.removeChild(textArea);
    copiedToast.open();
}

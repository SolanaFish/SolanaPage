function addBookmark() {
    var template = document.querySelector("#addBookmarkTemplate");
    if (template.category == "newCategory") {
        addNewCategoryDialog.open();
    } else {
        if (template.category === "") {
            noCategoryToast.open();
        } else {
            sumbitBookmarks();
        }
    }
}

function addBookmarkWithNewCategory() {
    var newCategory = document.getElementById('newCategory');
    sendNewCategory(newCategory.value).then(() => {
        var template = document.querySelector("#addBookmarkTemplate");
        template.category = newCategory.value;
        sumbitBookmarks();
    }).catch((err) => {
        if (err) {
            document.getElementById('errorCategoryToast').open();
        }
    });
}

function sumbitBookmarks() {
    var name = document.getElementById('addBookmarkName').value;
    var url = document.getElementById('addBookmarkUrl').value;
    var category = document.getElementById('addBookmarkCategory').selected;
    var colorButton = document.getElementById('customColorToggleButton').value;
    var hex = document.getElementById('customColorHex').value;
    var textColor = document.getElementById('customColorTextColor').selected;

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/addBookmark", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var sendString = '';
    sendString += "bookmarkName=" + name;
    sendString += "&bookmarkLink=" + url;
    sendString += "&category=" + category;
    if (colorButton && hex.length == 7) {
        sendString += "&color=" + hex;
        if(textColor) {
            sendString +="&text=white";
        } else {
            sendString +="&text=black";
        }
    }
    xhttp.send(sendString);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status === 200) {
                document.getElementById('addedBookmarkToast').open();
            } else {
                document.getElementById('errorBookmarkToast').open();
            }
        }
    };
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
    } catch (err) {} finally {}
    document.body.removeChild(textArea);
    copiedToast.open();
}

function submitDisplayMethod() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/displayMethod", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (document.getElementById('displayMethodMenu').checked) {
        xhttp.send("method=items");
    } else {
        xhttp.send("method=cards");
    }
    document.getElementById('displayMethodToast').open();
}

function hexFromRgb(red, green, blue) {
    return `#${('0' + red.toString(16)).slice(-2)}${('0' + green.toString(16)).slice(-2)}${('0' + blue.toString(16)).slice(-2)}`;
}

function hexToRgb(hex) {
    var colors = {};
    colors.red = parseInt(hex.slice(1, 3), 16);
    colors.green = parseInt(hex.slice(3, 5), 16);
    colors.blue = parseInt(hex.slice(5, 7), 16);
    return colors;
}

function updateCustomColor(fromSlider) {
    var item = document.getElementById('customColorItem');
    var redSlider = document.getElementById('customColorRedSlider');
    var greenSlider = document.getElementById('customColorGreenSlider');
    var blueSlider = document.getElementById('customColorBlueSlider');
    var hex = document.getElementById('customColorHex');
    var color;
    if (fromSlider) {
        color = hexFromRgb(redSlider.value, greenSlider.value, blueSlider.value);
        hex.value = color;
        item.style.background = color;

    } else {
        if (hex.value.length === 7) {
            color = hex.value;
            var colors = hexToRgb(hex.value);
            redSlider.value = colors.red;
            greenSlider.value = colors.green;
            blueSlider.value = colors.blue;
            item.style.background = color;
        }
    }
}

function submitColorfulItems() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/colorfulItems", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (document.getElementById('colorfulItemsToggle').checked) {
        xhttp.send("colorful=true");
    } else {
        xhttp.send("colorful=false");
    }
    document.getElementById('colorfulItemsToast').open();
}

function bookmarksSetup(from) {
    var displayMethodMenu = document.getElementById('displayMethodMenu');
    displayMethodMenu.addEventListener('change', () => {
        submitDisplayMethod();
    });
    var colorfulItemsToggle = document.getElementById('colorfulItemsToggle');
    colorfulItemsToggle.addEventListener('change', () => {
        submitColorfulItems();
    });
    var customColorToggleButton = document.getElementById('customColorToggleButton');
    customColorToggleButton.addEventListener('change', () => {
        document.getElementById('customColorCollapse').toggle();
    });
    var customColorRedSlider = document.getElementById('customColorRedSlider');
    var customColorGreenSlider = document.getElementById('customColorGreenSlider');
    var customColorBlueSlider = document.getElementById('customColorBlueSlider');
    var customColorHex = document.getElementById('customColorHex');
    var customColorTextColor = document.getElementById('customColorTextColor');
    customColorRedSlider.addEventListener('value-change', () => {
        updateCustomColor(true);
    });
    customColorGreenSlider.addEventListener('value-change', () => {
        updateCustomColor(true);
    });
    customColorBlueSlider.addEventListener('value-change', () => {
        updateCustomColor(true);
    });
    customColorHex.addEventListener('change', () => {
        updateCustomColor(false);
    });
    customColorTextColor.addEventListener('change', () => {
        var item = document.getElementById('customColorItemA');
        if (customColorTextColor.checked) {
            item.style.color = 'white';
        } else {
            item.style.color = 'black';
        }
    });
}

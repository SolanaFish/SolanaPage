var addBookmark = () => {
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
};

var addBookmarkWithNewCategory = () => {
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
};

var sumbitBookmarks = () => {
    var name = document.getElementById('addBookmarkName').value;
    var url = document.getElementById('addBookmarkUrl').value;
    var category = document.getElementById('addBookmarkCategory').selected;
    var colorButton = document.getElementById('customColorToggleButton').value;
    var hex = document.getElementById('customColorHex').value;
    var textColor = document.getElementById('customColorHexText').value;

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/addBookmark", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var sendString = '';
    sendString += "bookmarkName=" + name;
    sendString += "&bookmarkLink=" + url;
    sendString += "&category=" + category;
    if (colorButton && hex.length == 7 && textColor.length == 7) {
        sendString += "&color=" + hex;
        sendString += "&text=" + textColor;
    }
    xhttp.send(sendString);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status === 200) {
                document.getElementById('addedBookmarkToast').open();
                updateModulesMainPage('bookmarks-module');
                updateModulesSettings('bookmarks-module');
            } else {
                document.getElementById('errorBookmarkToast').open();
            }
        }
    };
};

var sendNewCategory = (categoryName) => {
    return new Promise((resolve, reject) => {
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
};

var deleteCategory = (categoryName) => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/deleteCategory", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + categoryName);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            updateModulesMainPage('bookmarks-module');
            updateModulesSettings('bookmarks-module');
        }
    };
};

var deleteBookmark = (name, category) => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/deleteBookmark", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("url=" + name + "&category=" + category);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            updateModulesMainPage('bookmarks-module');
            updateModulesSettings('bookmarks-module');
        }
    };
};

var copyToClipboard = (text) => {
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
};

var submitDisplayMethod = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/displayMethod", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (document.getElementById('displayMethodMenu').checked) {
        xhttp.send("method=items");
    } else {
        xhttp.send("method=cards");
    }
    document.getElementById('displayMethodToast').open();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            updateModulesMainPage('bookmarks-module');
        }
    };
};

var hexFromRgb = (red, green, blue) => {
    return `#${('0' + red.toString(16)).slice(-2)}${('0' + green.toString(16)).slice(-2)}${('0' + blue.toString(16)).slice(-2)}`;
};

var hexToRgb = (hex) => {
    var colors = {};
    colors.red = parseInt(hex.slice(1, 3), 16);
    colors.green = parseInt(hex.slice(3, 5), 16);
    colors.blue = parseInt(hex.slice(5, 7), 16);
    return colors;
};

var updateCustomColor = (fromSlider) => {
    var item = document.getElementById('customColorItem');
    var redSlider = document.getElementById('customColorRedSlider');
    var greenSlider = document.getElementById('customColorGreenSlider');
    var blueSlider = document.getElementById('customColorBlueSlider');
    var hex = document.getElementById('customColorHex');
    var color;
    if (fromSlider) {
        color = hexFromRgb(redSlider.immediateValue, greenSlider.immediateValue, blueSlider.immediateValue);
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
};

var updateCustomColorText = (fromSlider) => {
    var item = document.getElementById('customColorItemA');
    var redSlider = document.getElementById('customColorRedSliderText');
    var greenSlider = document.getElementById('customColorGreenSliderText');
    var blueSlider = document.getElementById('customColorBlueSliderText');
    var hex = document.getElementById('customColorHexText');
    var color;
    if (fromSlider) {
        color = hexFromRgb(redSlider.immediateValue, greenSlider.immediateValue, blueSlider.immediateValue);
        hex.value = color;
        item.style.color = color;

    } else {
        if (hex.value.length === 7) {
            color = hex.value;
            var colors = hexToRgb(hex.value);
            redSlider.value = colors.red;
            greenSlider.value = colors.green;
            blueSlider.value = colors.blue;
            item.style.color = color;
        }
    }
};

var submitColorfulItems = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/colorfulItems", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (document.getElementById('colorfulItemsToggle').checked) {
        xhttp.send("colorful=true");
    } else {
        xhttp.send("colorful=false");
    }
    document.getElementById('colorfulItemsToast').open();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            updateModulesMainPage('bookmarks-module');
        }
    };
};

var reorderCategories = () => {
    var categories = document.getElementById('categoriesList').children;
    var newOrder = [];
    for (var i = 0; i < categories.length; ++i) {
        console.log(categories[i].getAttribute('orginalPosition'));
        newOrder.push({
            orginalPosition: categories[i].getAttribute('orginalPosition')
        });
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/reorderCategories", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("data=" + JSON.stringify(newOrder));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            updateModulesMainPage('bookmarks-module');
            updateModulesSettings('bookmarks-module');
        }
    };
};

var reorderBookmarks = () => {
    var pages = document.getElementById('deleteBookmarkPages').children;
    var newOrder = [];
    for (var i = 0; i < pages.length; ++i) {
        newOrder[i] = [];
        var bookmarks = pages[i].children;
        for (var j = 0; j < bookmarks.length; ++j) {
            newOrder[i][j] = bookmarks[j].getAttribute('orgorginalPosition');
        }
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/bookmarks/reorderBookmarks", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("data=" + JSON.stringify(newOrder));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            updateModulesMainPage('bookmarks-module');
            updateModulesSettings('bookmarks-module');
        }
    };
};


var bookmarksSetup = (from) => {

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

    customColorRedSlider.addEventListener('immediate-value-change', () => {
        updateCustomColor(true);
    });
    customColorGreenSlider.addEventListener('immediate-value-change', () => {
        updateCustomColor(true);
    });
    customColorBlueSlider.addEventListener('immediate-value-change', () => {
        updateCustomColor(true);
    });
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

    var customColorRedSliderText = document.getElementById('customColorRedSliderText');
    var customColorGreenSliderText = document.getElementById('customColorGreenSliderText');
    var customColorBlueSliderText = document.getElementById('customColorBlueSliderText');
    var customColorHexText = document.getElementById('customColorHexText');

    customColorRedSliderText.addEventListener('immediate-value-change', () => {
        updateCustomColorText(true);
    });
    customColorGreenSliderText.addEventListener('immediate-value-change', () => {
        updateCustomColorText(true);
    });
    customColorBlueSliderText.addEventListener('immediate-value-change', () => {
        updateCustomColorText(true);
    });
    customColorRedSliderText.addEventListener('value-change', () => {
        updateCustomColorText(true);
    });
    customColorGreenSliderText.addEventListener('value-change', () => {
        updateCustomColorText(true);
    });
    customColorBlueSliderText.addEventListener('value-change', () => {
        updateCustomColorText(true);
    });
    customColorHexText.addEventListener('change', () => {
        updateCustomColorText(false);
    });

    Sortable.create(categoriesList, {
        animation: 150
    });
};

var redditWallpaper = () => {
    fetch('/randomWallpaper').then((res) => {
        return res.text();
    }).then((res) => {
        if (res) {
            var wallData = JSON.parse(res);
            document.body.style.backgroundImage = `url(${wallData.wallUrl})`;

            document.getElementById('wallpaperInfo').innerHTML = wallData.info;
        }
    }).catch(console.error);
};

// Settings

var submitRefresh = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/redditWallpaper/setRefresh", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("refresh=" + document.getElementById('redditRefreshSlider').value);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const toast = document.getElementById('refreshToast');
            toast.open();
        }
    };
};

var submitLinks = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/redditWallpaper/setLinks", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("links=" + document.getElementById('redditLinksSlider').value);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const toast = document.getElementById('linksToast');
            toast.open();
        }
    };
};

var submitSubreddits = () => {
    var redditInputs = document.getElementById('redditInputs');
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/redditWallpaper/setSubreddits", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var message = [];
    Array.prototype.slice.call(redditInputs.children).forEach((child) => {
        if (child.value) {
            message.push(child.value);
        }
    });
    console.log("subs=" + JSON.stringify(message));
    xhttp.send("subs=" + JSON.stringify(message));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const toast = document.getElementById('subredditsToast');
            toast.open();
        }
    };
};

var submitCheckUrlsButton = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/redditWallpaper/checkUrls", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("checked=" + document.getElementById('checkUrlsButton').checked);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const toast = document.getElementById('checkUrlsToast');
            toast.open();
        }
    };
};


var setupSlider = () => {
    var refreshSlider = document.getElementById('redditRefreshSlider');
    refreshSlider.addEventListener('change', () => {
        submitRefresh();
    });
    var linksSlider = document.getElementById('redditLinksSlider');
    linksSlider.addEventListener('change', () => {
        submitLinks();
    });
    var checkUrlsButton = document.getElementById('checkUrlsButton');
    checkUrlsButton.addEventListener('change', ()=> {
        submitCheckUrlsButton();
    });
    var redditInputs = document.getElementById('redditInputs');
    var lastChildListen = () => {
        if (redditInputs.lastChild.value !== "") {
            redditInputs.lastChild.removeEventListener('change', lastChildListen);
            redditInputs.appendChild(redditInputs.lastChild.cloneNode(true));
            //last child changes
            redditInputs.lastChild.value = "";
            redditInputs.lastChild.addEventListener('change', lastChildListen);
            redditInputs.scrollIntoView();
        }
    };
    redditInputs.lastChild.addEventListener('change', lastChildListen);
};

redditWallpaper();

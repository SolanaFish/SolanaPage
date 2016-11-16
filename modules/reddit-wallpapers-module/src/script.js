function redditWallpaper() {
    fetch('/randomWallpaper').then(function(res) {
        return res.text();
    }).then(function(res) {
        if (res) {
            var wallData = JSON.parse(res);
            document.body.style.backgroundImage = `url(${wallData.wallUrl})`;

            document.getElementById('wallpaperInfo').innerHTML = wallData.info;
        }
    }).catch(console.error);
}

function submitRefresh() {
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
}

function submitLinks() {
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
}

function submitSubreddits() {
    var redditInputs = document.getElementById('redditInputs');
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/redditWallpaper/setSubreddits", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var message = [];
    Array.prototype.slice.call(redditInputs.children).forEach((child) => {
        if (child.value) {
            message.push(child.value);
            console.log(message.toString());
        }
    });
    xhttp.send("subs=" + JSON.stringify(message));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const toast = document.getElementById('subredditsToast');
            toast.open();
        }
    };
}


function setupSlider() {
    var refreshSlider = document.getElementById('redditRefreshSlider');
    refreshSlider.addEventListener('change', () => {
        submitRefresh();
    });
    var linksSlider = document.getElementById('redditLinksSlider');
    linksSlider.addEventListener('change', () => {
        submitLinks();
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
}

redditWallpaper();

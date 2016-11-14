function redditWallpaper () {
    fetch('/randomWallpaper').then(function(res) {
        return res.text();
    }).then(function(res) {
        document.body.style.backgroundImage=`url(${res})`;
    }).catch(console.error);
}
redditWallpaper();

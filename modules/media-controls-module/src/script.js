var mediaSend = (action= 'update') => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/media/controls", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("action=" + action);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            var res = JSON.parse(this.responseText);
            var cover = document.getElementById('cover');
            var title = document.getElementById('title');
            var artist = document.getElementById('artist');
            cover.src = res.imgUrl;
            title.innerHTML = res.title;
            artist.innerHTML = res.artist;
        }
    };
};

setInterval(mediaSend, 10000);

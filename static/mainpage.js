function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function OpenInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function submitForm(id) {
    document.getElementById(id).submit();
    location.reload(); // TODO: remove reload
}

function toggleSettings() {
    fetch("/bookmarks/menuView").then(function(res) {
        return res.text();
    }).then(function(res) {
        document.querySelector("#addNewBookmark").innerHTML = res;
    }).then(function() {
        document.querySelector("#collapse").toggle();
    });
}

function OpenInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function submitActiveModules() {
    let activeModulesButtons = Array.prototype.slice.call(document.getElementById('activeModulesDiv').children);
    let activeModulesJSON = [];
    activeModulesButtons.forEach((button) => {
        activeModulesJSON.push({
            name: button.name,
            active: button.active
        });
    });
    xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/updateModules', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log(JSON.stringify(activeModulesJSON));
    xhttp.send('modules=' + JSON.stringify(activeModulesJSON));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('setOk');
        }
    };
}

document.addEventListener('DOMContentLoaded', function(event) {
    app.selected=0;
});

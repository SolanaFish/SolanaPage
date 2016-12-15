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
    xhttp.send('modules=' + JSON.stringify(activeModulesJSON));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('setOk');
        }
    };
}

function submitTheme() {
    var themeDropdownMenu = document.getElementById('themeDropdownMenu');
    xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/changeTheme', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('theme=' + themeDropdownMenu.value);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('setOk');
            document.getElementById('themeToast').open();
        }
    };
}

document.addEventListener('DOMContentLoaded', function(event) {
    app.selected=0;
    app.settingsSelected=0;
});

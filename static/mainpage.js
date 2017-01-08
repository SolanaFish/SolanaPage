var submitActiveModules = () => {
    let modulesList = document.getElementById('modulesList');

    let modulesChildrenList = Array.prototype.slice.call(modulesList.children);
    let activeModulesJSON = [];
    modulesChildrenList.forEach((moduleItem) => {
        let moduleButton = moduleItem.children[0];
        activeModulesJSON.push({
            name: moduleButton.name,
            active: moduleButton.active
        });
    });
    xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/updateModules', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('modules=' + JSON.stringify(activeModulesJSON));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('activeModulesToast').open();
        }
    };
};

var submitTheme = () => {
    var themeDropdownMenu = document.getElementById('themeDropdownMenu');
    xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/changeTheme', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('theme=' + themeDropdownMenu.value);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('themeToast').open();
        }
    };
};

document.addEventListener('DOMContentLoaded', (event) => {
    app.selected=0;
    app.settingsSelected=0;
});

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

var updateModulesMainPage = (moduleName) => {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', `/main/${moduleName}`, true);
    xhttp.send(null);
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var dom = document.getElementById(moduleName);
            dom.innerHTML = this.responseText;
        }
    };
};

var updateModulesSettings = (moduleName) => {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', `/settings/${moduleName}`, true);
    xhttp.send(null);
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var dom = document.getElementById(`${moduleName}-settings`);
            dom.innerHTML = this.responseText;
        }
    };
};

document.addEventListener('DOMContentLoaded', (event) => {
    app.selected=0;
    app.settingsSelected=0;
});

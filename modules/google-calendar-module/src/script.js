var setupCalendar = () => {
    var calendarEvents = document.getElementById('calendarEvents');
    var calendarRefresh = document.getElementById('calendarRefresh');
    calendarEvents.addEventListener('change', () => {
        submitCalendarEvents();
    });
    calendarRefresh.addEventListener('change', () => {
        submitCalendarRefresh();
    });
};

var submitCalendarEvents = () => {
    var calendarEvents = document.getElementById('calendarEvents');
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/calendar/submitCalendarEvents", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("events=" + calendarEvents.value);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            document.getElementById('calendarEventsToast').open();
            updateModulesMainPage('google-calendar-module');
        }
    };
};

var submitCalendarRefresh = () => {
    var calendarRefresh = document.getElementById('calendarRefresh');
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/calendar/submitCalendarRefresh", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("refresh=" + calendarRefresh.value);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            document.getElementById('calendarRefreshToast').open();
            updateModulesMainPage('google-calendar-module');
        }
    };
};

var calendarLogout = (confirmed) => {
    if (confirmed) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/calendar/logout", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("logout=yes");
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status === 200) {
                document.getElementById('calendarLogoutToast').open();
                updateModulesMainPage('google-calendar-module');
            }
        };
    } else {
        document.getElementById('calendarLogoutDialog').open();
    }
};

var submitCalendarSegments = () => {
    var calendarSegments = document.getElementById('calendarSegments');
    var segments = calendarSegments.children;
    var arr = [];
    for (var i = 0; i < segments.length; ++i) {
        let button = segments[i].children[0];
        arr.push({
            name: button.name,
            active: button.checked
        });
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/calendar/updateSegments", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('data=' + JSON.stringify(arr));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            document.getElementById('calendarSegmentsToast').open();
            updateModulesMainPage('google-calendar-module');
        }
    };
};

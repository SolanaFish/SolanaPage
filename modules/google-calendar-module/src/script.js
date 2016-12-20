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
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/calendar/updateSegments", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    for (var i = 0; i < segments.length; ++i) {
        // msg += `${segments[i].name}=${segments[i].checked}&`;
        arr.push({
            name: segments[i].name,
            active: segments[i].checked
        });
    }
    xhttp.send('data='+JSON.stringify(arr));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status === 200) {
            document.getElementById('calendarLogoutToast').open();
        }
    };
};

// scripts for navigation bar and other global functions
let nav;

(function() {
    "use strict";

    function init() {
        // github supports no .html at the end for nicer links
        nav = new Vue({
            el: '#navbar',
            data: {
                items: [
                    { text: "Home", link: "index" },
                    { text: "Game", link: "game" },
                ],
                message: ''
            }
        });
        let params = window.location.search;
        params.replace('?', '').split('&').forEach((s) => {
            let kv = s.split('=');
            if (kv[0] === 'logout') {
                logout();
            }
        });
        addLoginInfo();
    }

    window.addEventListener('load', init);
})();

function logout() {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

function addLoginInfo() {
    let name = getCookie('name');
    nav.items.splice(2);
    if (!name) {
        nav.items.push({ text: "Log In", link: "index" });
    } else {
        nav.items.push({ text: "Notes", link: "personal" });
        nav.items.push({ text: `Log Out (${name})`, link: "?logout" });
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
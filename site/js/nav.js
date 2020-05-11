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
                    { text: "Home", link: "index.html" },
                    { text: "Game", link: "game.html" },
                ],
                message: ''
            }
        });
        addLoginInfo();
    }

    window.addEventListener('load', init);
})();

function addLoginInfo() {
    let name = getCookie('name');
    nav.items.splice(2);
    if (!name) {
        nav.items.push({ text: "Log In", link: "index.html" });
    } else {
        nav.items.push({ text: "Notes", link: "personal.html" });
        nav.items.push({ text: "Log Out", link: "index.html?logout" });
        nav.message = `Welcome, ${name}`;
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
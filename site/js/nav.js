(function() {
    "use strict";

    function init() {
        // github supports no .html at the end for nicer links
        var nav = new Vue({
            el: '#navbar',
            data: {
                items: [
                    { text: "Home", link: "index.html" },
                    { text: "About", link: "about.html" },
                    { text: "Game", link: "game.html" },
                    { text: "test", link: "personal.html?prisoner=tp" },
                    { text: "Notes", link: "personal.html" },
                    { text: "Log Out", link: "index.html?logout" }
                ],
                title: "SAD BLOCK A"
            }
        });
    }

    window.addEventListener('load', init);
})();
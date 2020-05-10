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
                    { text: "Log Out", link: "?logout" }
                ],
                title: "SAD BLOCK A"
            }
        });
    }

    window.addEventListener('load', init);
})();
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
                    { text: "Bounty Hunt", link: "bountyhunt.html" }
                ]
            }
        });
    }

    window.addEventListener('load', init);
})();
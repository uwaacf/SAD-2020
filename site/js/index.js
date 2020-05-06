(function() {
    "use strict";

    let id = x => document.getElementById(x);

    async function init() {
        let cells = new Vue({
            el: '#content',
            data: {
                names: []
            }
        });
        let response = await fetch('resources/names.json');
        let json = await response.json();
        for (let initials in json) {
            cells.names.push({
                name: json[initials],
                link: `personal.html?prisoner=${initials}`
            });
        }
        cells.names = shuffle(cells.names);
        id('close').addEventListener('click', close);
    }

    /* Note stuff */

    function close() {
        id('popup-view').classList.add('hidden');
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }


    window.addEventListener('load', init);
})();
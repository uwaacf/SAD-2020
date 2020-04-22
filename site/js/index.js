(function() {
    "use strict";

    function init() {
        var title = new Vue({
            el: '#title',
            data: {
                text: 'Hello'
            }
        });
        var content = new Vue({
            el: '#info',
            data: {
                text: 'someone come up with a better title and format.'
            }
        });
    }

    window.addEventListener('load', init);
})();
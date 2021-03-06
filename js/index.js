(function() {
    "use strict";

    let id = x => document.getElementById(x);
    let inits = {};

    async function init() {
        let cells = new Vue({
            el: '#content',
            data: {
                names: []
            }
        });
        let options = new Vue({
            el: '#options',
            data: {
                names: []
            }
        });
        let params = window.location.search;
        params.replace('?', '').split('&').forEach((s) => {
            let kv = s.split('=');
            if (kv[0] === 'logout') {
                logout();
            }
        });
        if (!getCookie('pass')) {
            id('popup-view').classList.remove('hidden');
            id('close').addEventListener('click', close);
        }
        id('login').addEventListener('submit', login);
        let response = await fetch('resources/names.json');
        let json = await response.json();
        for (let initials in json) {
            inits[json[initials]] = initials;
            options.names.push(json[initials]);
            cells.names.push({
                name: json[initials],
                link: `personal.html?prisoner=${initials}`,
                img: `img/prisoner/${initials}.png`
            });
        }
        cells.names = shuffle(cells.names);
        options.names = options.names.sort();
    }

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

    /* Login functions */
    async function login(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        let form = id('login');
        id('submit').disabled = true;
        let password = form.psw.value;
        let name = form.uname.value;
        let user = (name + password).hashCode();
        let pass = password.hashCode();
        let auth = await fetch('resources/passwords.json');
        let json = await auth.json();
        if (json[`${user}`] === `${pass}`) {
            document.cookie = `name=${name};path=/`;
            document.cookie = `pass=${password};path=/`;
            document.cookie = `inits=${inits[name]};path=/`;
            id('submit').disabled = false;
            close();
            addLoginInfo();
        } else {
            // console.log(`"${user}": "${pass}"`);
            id('error-message').innerText = 'Your Identifier is incorrect!';
            id('submit').disabled = false;
        }
        return false;
    }

    Object.defineProperty(String.prototype, 'hashCode', {
        value: function() {
            var hash = 0,
                i, chr;
            for (i = 0; i < this.length; i++) {
                chr = this.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
    });

    window.addEventListener('load', init);
})();
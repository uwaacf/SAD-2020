(function() {
    "use strict";

    let id = x => document.getElementById(x);
    let qs = x => document.querySelector(x);
    let notes = [];
    let vnote;
    let page;
    let prisoner;
    let initials;
    let name;
    let cur = 0;

    function init() {
        id('messages-img').addEventListener('click', getNotes);
        id('close').addEventListener('click', close);
        id('right').addEventListener('click', () => slide(1));
        id('left').addEventListener('click', () => slide(-1));
        populateInfo();
    }

    async function populateInfo() {
        let title = new Vue({
            el: 'title',
            data: {
                name: ''
            }
        });
        let description = new Vue({
            el: '#description',
            data: {
                title: '',
                crime: '"updog"',
                time: '10 years',
                info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel bibendum diam. Aliquam lobortis, nisi sit amet consequat tempus, tortor augue egestas ex, sit amet fermentum metus lectus vel velit. Proin varius orci efficitur dui maximus, et dictum neque pharetra. Nulla facilisi. Sed vel facilisis diam, ut auctor est. Donec ullamcorper luctus nibh, ultricies consequat ligula vestibulum in. Aliquam vel enim lorem. Duis mattis odio arcu, vel vehicula velit iaculis ut. In malesuada tempus porta. Donec tincidunt accumsan felis et ultricies. Curabitur pellentesque mi id purus aliquet tempus. Pellentesque ullamcorper, odio eu posuere interdum, odio urna cursus elit, in molestie.'
            }
        });
        let image = new Vue({
            el: '#face',
            data: {
                img: ''
            }
        });
        let params = window.location.search;
        params.replace('?', '').split('&').forEach((s) => {
            let kv = s.split('=');
            if (kv[0] === 'prisoner') {
                initials = kv[1];
            }
        });
        let names = await fetch('resources/names.json');
        let json = await names.json();
        prisoner = json[initials];
        name = prisoner;
        title.name = prisoner;
        description.title = prisoner;
        image.img = 'img/' + initials + '.png';
    }

    /* Note stuff */

    function close() {
        id('popup-view').classList.add('hidden');
    }

    function slide(dir) {
        cur += dir;
        if (cur < 0) {
            cur += notes.length;
        } else if (cur >= notes.length) {
            cur -= notes.length;
        }
        jump(cur);
    }

    function jump(index) {
        if (cur >= notes.length) {
            // Wait
            setTimeout(() => jump(index), 100);
        } else {
            cur = index;
            vnote.paragraphs = notes[cur].paragraphs;
            vnote.name = notes[cur].name;
            page.num = `${cur + 1} / ${notes.length}`;
        }
    }

    async function getNotes() {
        let password = getCookie('pass');
        if (!password) {
            alert('Please identify yourself on the homepage first!');
        } else {
            let user = (name + password).hashCode();
            let pass = password.hashCode();
            let auth = await fetch('resources/passwords.json');
            let json = await auth.json();
            if (json[`${user}`] === `${pass}`) {
                if (vnote === undefined) {
                    vnote = new Vue({
                        el: '#note',
                        data: {
                            name: '',
                            paragraphs: ['reading message...']
                        }
                    });
                    page = new Vue({
                        el: '#pagenum',
                        data: {
                            num: '? / ?'
                        }
                    });
                    notes = [];
                    let response = await fetch('resources/notes/notes.json');
                    let json = await response.json();
                    json[initials].forEach(s => fetchNote(s));
                }
                jump(cur);
                id('popup-view').classList.remove('hidden');
            } else {
                alert(`You do not have permission to look at ${name}'s notes!`);
            }
        }
    }

    async function fetchNote(name) {
        let response = await fetch(`resources/notes/${initials}_${name}.txt`);
        let text = await response.text();
        let lines = [];
        text.split(/[\r\n]+/).forEach((s) => {
            if (s !== '') {
                lines.push(s);
            }
        });
        notes.push({ 'name': name, paragraphs: lines });
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
(function() {
    "use strict";

    let id = x => document.getElementById(x);
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
        let seeNotes = false;
        if (params) {
            params.replace('?', '').split('&').forEach((s) => {
                let kv = s.split('=');
                if (kv[0] === 'prisoner') {
                    initials = kv[1];
                }
            });
        } else {
            let inits = getCookie('inits');
            if (inits) {
                initials = inits;
            }
            seeNotes = true;
        }
        let names = await fetch('resources/names.json');
        let json = await names.json();
        prisoner = json[initials];
        name = prisoner;
        title.name = prisoner;
        description.title = prisoner;
        if (!name) {
            window.location.href = "index";
        }
        image.img = 'img/prisoner/' + initials + '.png';
        let info = await fetch('resources/sad_stories/' + initials + '.txt');
        let text = await info.text();
        description.info = text;
        if (seeNotes) {
            getNotes();
        }
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
            let next = notes[cur];
            if (next.text) {
                vnote.paragraphs = notes[cur].paragraphs;
            } else {
                vnote.img = next.source;
            }
            vnote.text = next.text;
            vnote.name = next.name;
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
                            text: true,
                            paragraphs: ['reading message...']
                        }
                    });
                    page = new Vue({
                        el: '#pagenum',
                        data: {
                            num: '? / ?'
                        }
                    });
                    let link = new Vue({
                        el: '#link',
                        data: {
                            link: ''
                        }
                    });
                    notes = [];
                    let links = await fetch('resources/links.json');
                    let jsonlinks = await links.json();
                    link.link = jsonlinks[initials];
                    let response = await fetch('resources/notes.json');
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

    async function fetchNote(note) {
        let name = note['name'];
        let msg = note['message'];
        if (name !== 'img') {
            notes.push({ 'name': name, text: true, paragraphs: msg });
        } else {
            name = msg.split('.')[0];
            notes.push({ 'name': name, text: false, source: `img/notes/${msg}` });
        }
        page.num = `${cur + 1} / ${notes.length}`;
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
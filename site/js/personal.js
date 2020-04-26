(function() {
    "use strict";

    let id = x => document.getElementById(x);
    let qs = x => document.querySelector(x);
    let notes = [];
    let vnote;
    let page;
    let prisoner;
    let initials;
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
        title.name = prisoner;
        description.title = prisoner;
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
        if (verify()) {
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

    async function verify() {
        return true;
    }

    window.addEventListener('load', init);
})();
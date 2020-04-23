(function() {
    "use strict";

    let id = x => document.getElementById(x);
    let qs = x => document.querySelector(x);
    let notes = [{
            name: 'Jed Chen',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            name: 'George Huang',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            name: 'Leo Tsai',
            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        }
    ];
    let page;
    let vnote;
    let cur = 0;

    function init() {
        new Vue({
            el: '#title',
            data: {
                text: 'Joyce "Joyce" Li'
            }
        });
        new Vue({
            el: '#info',
            data: {
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }
        });
        id('messages-img').addEventListener('click', getNotes);
        id('close').addEventListener('click', close);
        id('right').addEventListener('click', () => slide(1));
        id('left').addEventListener('click', () => slide(-1));
        getNotes();
    }

    function close() {
        console.log('close');
        id('notes-view').classList.add('hidden');
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
        cur = index;
        vnote.name = notes[cur].name;
        vnote.message = notes[cur].message;
        page.num = `${cur + 1} / ${notes.length}`;
    }

    function getNotes() {
        if (verify()) {
            // let response = await fetch('notes/notes.json');
            // let json = await response.json();
            vnote = new Vue({
                el: '#note',
                data: {
                    name: '',
                    message: ''
                }
            });
            page = new Vue({
                el: '#pagenum',
                data: {
                    num: ''
                }
            });
            jump(0);
            id('notes-view').classList.remove('hidden');
        }
    }

    async function verify() {
        return true;
    }

    window.addEventListener('load', init);
})();
// TODO: add module pattern later?

function init() {
    var title = new Vue({
        el: '#title',
        data: {
            title: 'Hello!'
        }
    })
    var content = new Vue({
        el: '#content',
        data: {
            message: 'This is some content.'
        }
    })
}

window.addEventListener('load', init);
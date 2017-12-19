var app = (function () {
    'use strict';

    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
    }

    var view = {
        init: function () {
            if (!('fetch' in window)) {
                // TODO: handle
                // console.log('Fetch API not found, try including the polyfill');
                return;
            }

            let liters = document.getElementById('liters');
            view.socketConnect();
        },
        socketConnect: function () {
            var socket = io.connect('http://localhost:3000');
            socket.on('liters', function (data) {
                liters.innerHTML = data;
                console.log(data);
            });
        }
    };

    view.init();

})();
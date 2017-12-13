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


        }
    };

    view.init();

})();
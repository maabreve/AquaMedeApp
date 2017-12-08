var app = (function () {
    'use strict';

    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
    }

    var model = {

    }

    var view = {
        init: function () {
            if (navigator.serviceWorker) {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then(function (registration) {
                        console.log(
                            "ServiceWorker registration successful with scope:",
                            registration.scope
                        );
                    })
                    .catch(function (error) {
                        console.log("ServiceWorker registration failed:", error);
                    });
            }

        }
    };

    var controller = {

    };

    view.init();

})();
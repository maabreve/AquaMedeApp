var app = (function () {
    'use strict';

    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
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

            // controller.fetchNetworkServer();
        }
    };

    var controller = {
        logError: function (error) {
            // TODO: handle
            console.log('Looks like there was a problem: \n', error);
        },
        fetchNetworkServer: function () {
            return fetch('/api/server')
                .then(response => {
                    if (!response.ok) {
                        window.location.href = "/offline";
                        throw Error(response.statusText);
                    }
                    return response.json();
                })
                .catch(err => {
                    console.log('ERRO -> ', err);  
                });
        },

        /* Local Storage functions */
        createIndexedDB: function () {
            if (!('indexedDB' in window)) { return null; }
            return idb.open('aquamede', 1, function (upgradeDb) {
                if (!upgradeDb.objectStoreNames.contains('boards')) {
                    const eventsOS = upgradeDb.createObjectStore('boards', { keyPath: 'id' });
                }
            });
        },
        getLocalServers: function () {
            if (!('indexedDB' in window)) { return null; }
            return dbPromise.then(db => {
                const tx = db.transaction('boards', 'readonly');
                const store = tx.objectStore('boards');
                return store.getAll();
            });
        },
        saveLocalServer: function (boards) {
            if (!('indexedDB' in window)) { return null; }
            return dbPromise.then(db => {
                const tx = db.transaction('boards', 'readwrite');
                const store = tx.objectStore('boards');
                return Promise.all(boards.map(board => store.put(board)))
                    .catch(() => {
                        tx.abort();
                        throw Error('Boards were not added to the store');
                    });
            });
        }
    }

    view.init();

})();
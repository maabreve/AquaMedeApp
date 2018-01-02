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

            // get cache board
            controller.fetchCacheBoards()
                .then(boards => {
                    if (!boards || boards.length === 0) {
                        // fetch local board
                        controller.fetchLocalBoard().then(localBoards => {
                            if (localBoards && localBoards.length > 0) {
                                // fetch cloud board
                                console.log('localboards ', localBoards);
                                 controller.fetchCloudBoard(localBoards[0].serialNumber)
                                    .then(cloudBoard => {
                                        if (!cloudBoard || cloudBoard === null) {
                                            console.log('cloud board not registered ');
                                            window.location.href = "/boardNotRegistered";
                                        } else {
                                            //TODO: implement multi boards
                                            let newCacheBoard = [];
                                            newCacheBoard.push({
                                                _id: cloudBoard._id,
                                                id: 1,
                                                serialNumber: cloudBoard.serialNumber,
                                                dateUserRegister: new Date()
                                            });

                                            controller.saveCacheBoard(newCacheBoard).then(() => {
                                                register.style.display = 'block',
                                                console.log('cache board saved')
                                            }).catch(err => {
                                                // TODO: handle
                                                console.log('error in save cache board ', err);
                                                window.location.href = "/boardNotRegistered";
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        console.log('error in fetch cloud board ', err);
                                        window.location.href = "/boardNotRegistered";
                                    });
                            } else {
                                // TODO: handle
                                console.log('local board not registered');
                                window.location.href = "/boardNotRegistered";
                            }
                        });
                    } else {
                        // TODO: implement multi boards
                        // get cloud board
                        controller.fetchCloudBoard(boards[0].serialNumber).then(b => {
                            console.log('cloud boards ', b);
                            if (!b) {
                                console.log('board not regisrtered in the cloud');
                                window.location.href = '/boardNotRegistered';
                            } else {
                                register.style.display = 'block';
                            }
                        });
                    }
                }).catch(err => {
                    console.log('get cache boards error ', err);
                });
            }
    };

    var controller = {
        fetchLocalBoard: function () {
            var headers = new Headers();
            headers.append("Content-Type", "application/json");

            return fetch('http://localhost:3001/api/board', {
                method: 'GET',
                headers: headers,
                mode: 'cors',
                cache: 'default'
            })
                .then(function (response) {
                    if (!response.ok) {
                        // TODO: handle
                        throw Error(response.statusText);
                    }

                    return response.json();
                })
                .catch(err => {
                    // TODO: handle
                    console.log(err);
                    window.location.href = "/boardNotRegistered";
                });
        },

        fetchCloudBoard: function (serialNumber) {
            var headers = new Headers();
            headers.append("Content-Type", "application/json");

            return fetch('/api/board/' + serialNumber)
                .then(response => {
                    if (!response.ok) {
                        window.location.href = "/boardNotRegistered";
                        throw Error(response.statusText);
                    }

                    return response.json();
                })
                .catch(err => {
                    // TODO: handle
                    console.log('ERRO -> ', err);
                    window.location.href = "/boardNotRegistered";
                });
        },

        /* Cache Local Storage functions */
        createIndexedDB: function () {
            if (!('indexedDB' in window)) { return null; }
            return idb.open('aquamede', 1, function (upgradeDb) {
                if (!upgradeDb.objectStoreNames.contains('boards')) {
                    const eventsOS = upgradeDb.createObjectStore('boards', { keyPath: 'id' });
                }
            });
        },

        fetchCacheBoards: function () {
            if (!('indexedDB' in window)) { return null; }
            const dbPromise = this.createIndexedDB();
            return dbPromise.then(db => {
                const tx = db.transaction('boards', 'readonly');
                const store = tx.objectStore('boards');
                return store.getAll();
            });
        },

        saveCacheBoard: function (boards) {
            if (!('indexedDB' in window)) { return null; }
            const dbPromise = this.createIndexedDB();
            return dbPromise.then(db => {
                const tx = db.transaction('boards', 'readwrite');
                const store = tx.objectStore('boards');
                return Promise.all(boards.map(board => { store.put(board), console.log('board saved in local cache', board) }))
                    .catch(() => {
                        tx.abort();
                        throw Error('Boards were not added to the store');
                    });
            });
        }
    }

    view.init();

})();
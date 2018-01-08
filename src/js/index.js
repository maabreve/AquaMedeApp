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

            let login = document.getElementById('login');
            let messageBox = document.getElementById('messageBox');
            let message = document.getElementById('message');

            // get cache board
            controller.fetchCacheBoards()
                .then(boards => {
                    if (!boards || boards.length === 0) {
                        // first time 
                        // fetch local board
                        controller.fetchLocalBoard().then(localBoard => {
                            if (localBoard) {
                                // fetch cloud board
                                controller.fetchCloudBoard(localBoard.serialNumber)
                                    .then(cloudBoard => {

                                        if (!cloudBoard || cloudBoard === null) {
                                            messageBox.style.display = 'block';
                                            message.innerHTML = "Servidor remoto não localizado";
                                            return;
                                        }

                                        //TODO: implement multi boards
                                        let newCacheBoard = [];
                                        newCacheBoard.push({
                                            id: 1,
                                            _id: cloudBoard._id,
                                            serialNumber: cloudBoard.serialNumber,
                                            dateUserRegister: new Date()
                                        });

                                        controller.saveCacheBoard(newCacheBoard).then(() => {
                                            login.style.display = 'block';
                                            console.log('new board cached');
                                        }).catch(err => {
                                            // TODO: handle
                                            messageBox.style.display = 'block';
                                            message.innerHTML = err;
                                        });
                                    })
                                    .catch(err => {
                                        messageBox.style.display = 'block';
                                        message.innerHTML = err;
                                    });
                            } else {
                                // TODO: handle
                                messageBox.style.display = 'block';
                                message.innerHTML = "Servidor local não localizado";
                            }
                        });
                    } else {
                        // TODO: implement multi boards
                        login.style.display = 'block';
                        
                        // get cloud board
                        // controller.fetchCloudBoard(boards[0].serialNumber).then(board => {
                        //     if (!board) {
                        //         messageBox.style.display = 'block';
                        //         message.innerHTML = "Servidor remoto não localizado";
                        //     } else {
                        //         login.style.display = 'block';
                        //     }
                        // });
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

            return fetch('http://localhost:3002/api/board', {
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
                    messageBox.style.display = 'block';
                });
        },

        fetchCloudBoard: function (serialNumber) {
            var headers = new Headers();
            headers.append("Content-Type", "application/json");

            return fetch('/api/board/' + serialNumber)
                .then(response => {
                    if (!response.ok) {
                        messageBox.style.display = 'block';
                        throw Error(response.statusText);
                    }

                    return response.json();
                })
                .catch(err => {
                    // TODO: handle
                    console.log('ERRO -> ', err);
                    messageBox.style.display = 'block';
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
                return Promise.all(boards.map(board => {
                    store.put(board),
                        console.log('board saved in local cache', board)
                }))
                    .catch(() => {
                        tx.abort();
                        throw Error('Boards were not added to the store');
                    });
            });
        }
    }

    view.init();

})();
var app = (function () {
    'use strict';

    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
    }

    var view = {
        init: function () {
            // get cache board
            let dashboardView = document.getElementById('dashboard-view');
            let informationsView = document.getElementById('informations-view');
            let liters = document.getElementById('liters');
            var informationsForm = document.forms.namedItem('informationsForm');
            var initialHydrometer = document.getElementById('initialHydrometer');
            var peoplesInTheHouse = document.getElementById('peoplesInTheHouse');
            var initialHydrometerError = document.getElementById('initialHydrometerError');
            var peoplesInTheHouseError = document.getElementById('peoplesInTheHouseError');

            boardManager.fetchCacheBoards()
                .then(boards => {
                    boards.map(board => {
                        if (!board.initialHydrometer) {
                            informationsView.style.display = "block";
                            // event handlers
                            informationsForm.addEventListener('submit', function (ev) {
                                ev.preventDefault();
                                boardManager.updateBoard();
                            }, false);

                        } else {
                            dashboardView.style.display = "block";
                            view.socketConnect();
                        }
                    });
                })
                .catch(err => {
                    window.location.href = "/login";
                });
        },

        socketConnect: function () {
            var socket = io.connect('http://localhost:3000');
            socket.on('liters', function (data) {
                liters.innerHTML = data;
                console.log(data);
            });
        }
    };

    var boardManager = {
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

        updateBoard: function () {
            boardManager.fetchCacheBoards()
                .then(boards => {
                    boards.map(board => {
                        var editBoard = {
                            serialNumber: board.serialNumber,
                            initialHydrometer: initialHydrometer.value,
                            peoplesInTheHouse: peoplesInTheHouse.value
                        };

                        const headers = new Headers({
                            "Content-Type": "application/JSON",
                            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                            "X-Custom-Header": "ProcessThisImmediately"
                        });

                        const body = JSON.stringify(editBoard);
                        let editBoards = [];
                        let dashboardView = document.getElementById('dashboard-view');
                        let informationsView = document.getElementById('informations-view');
                        fetch('http://localhost:3001/api/board', {
                            method: 'PUT',
                            headers: headers,
                            body: body,
                            mode: 'cors'
                        })
                            .then(
                            fetch('api/board', {
                                method: 'PUT',
                                headers: headers,
                                body: body,
                                mode: 'cors'
                            })
                                .then(         
                                    console.log('vai editar board ============'),
                                    editBoard.id = 1,
                                    editBoards.push(editBoard),
                                    boardManager.saveCacheBoard(editBoards),
                                    console.log('board editado ============'),
                                    console.log('informations updated'),
                                    dashboardView.style.display = "block",
                                    informationsView.style.display = "none"
                                )
                                .catch(err => {
                                    // TODO: handle
                                    console.log('error in update informations in cloud board');
                                })
                            )
                            .catch(err => {
                                // TODO: handle
                                console.log('error in update informations in local board');
                            });
                    })
                });
        }, 

        saveCacheBoard: function (boards) {
            if (!('indexedDB' in window)) { return null; }
            const dbPromise = this.createIndexedDB();
            return dbPromise.then(db => {
                const tx = db.transaction('boards', 'readwrite');
                const store = tx.objectStore('boards');
                return Promise.all(boards.map(board => { store.put(board), 
                        console.log('board saved in local cache', board) }))
                    .catch(() => {
                        tx.abort();
                        throw Error('Boards were not added to the store');
                    });
            });
        }
    };

    view.init();

})();
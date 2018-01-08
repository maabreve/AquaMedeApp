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
            let diaryCounter = document.getElementById('diaryCounter');
            let monthlyCounter = document.getElementById('monthlyCounter');
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
                            view.socketConnect(board.serialNumber);
                            // get counters
                            counterManager.fetchCloudCounter(board.serialNumber).then(counters=> {
                                console.log('counters ', counters[0]);
                                diaryCounter.innerHTML = counters[0].diaryCounter ? counters[0].diaryCounter : 0;
                                monthlyCounter.innerHTML = counters[0].monthlyCounter ? counters[0].monthlyCounter : 0;
                            });

                            dashboardView.style.display = "block";
                        }
                    });
                })
                .catch(err => {
                    window.location.href = "/login";
                });
        },

        socketConnect: function (serialNumber) {
            var socket = io.connect('http://localhost:3000');
            socket.on(serialNumber, function (data) {
                console.log('counters --> ', data);
                diaryCounter.innerHTML = data.diary;
                monthlyCounter.innerHTML = data.diary;
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
                        fetch('http://localhost:3002/api/board', {
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
                                    editBoard.id = 1,
                                    editBoards.push(editBoard),
                                    boardManager.saveCacheBoard(editBoards),
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


    var counterManager = {
        fetchCloudCounter: function (serialNumber) {
            var headers = new Headers();
            headers.append("Content-Type", "application/json");

            return fetch('/api/counter/' + serialNumber)
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
        }
    }

    view.init();

})();
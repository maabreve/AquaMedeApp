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

            // controls
            var informationsForm = document.forms.namedItem('informationsForm');
            var initialHydrometer = document.getElementById('initialHydrometer');
            var peoplesInTheHouse = document.getElementById('peoplesInTheHouse');
            var initialHydrometerError = document.getElementById('initialHydrometerError');
            var peoplesInTheHouseError = document.getElementById('peoplesInTheHouseError');

            // event handlers
            informationsForm.addEventListener('submit', function (ev) {
                ev.preventDefault();
                boardManager.updateCloudBoard();
            }, false);
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

        updateCloudBoard: function () {
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
                            "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",  
                            "X-Custom-Header": "ProcessThisImmediately"
                        });


                        const body = JSON.stringify(editBoard);
                        
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
                                console.log('informations updated'),
                                window.location.href = '/dashboard'
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
        }

    }

    view.init();

})();
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
            var initialregister = document.getElementById('initialregister');
            var peoples = document.getElementById('peoples');
            var target = document.getElementById('target');
            var initialcountererror = document.getElementById('initialregistererror');
            var peopleserror = document.getElementById('peopleserror');
            var targeterror = document.getElementById('targeterror');
            var that = this;
            // event handlers
            informationsForm.addEventListener('submit', function (ev) {
                ev.preventDefault();
                boardManager.updateBoard();

            }, false);

            initialregister.addEventListener('keydown', function (ev) {
            }, false);

            peoples.addEventListener('keydown', function (ev) {
            }, false);

            peoples.addEventListener('keydown', function (ev) {
            }, false);

        }
    };

    var boardManager = {
        fetchBoard: function () {
            return fetch('api/board')
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response.json();
                })
                .catch(); // controller.logError);
        },
        updateBoard: function () {
            this.fetchBoard()
                .then(board => {
                    const currentboard = {
                        _id: board[0]._id,
                        initialRegister: initialregister.value,
                        peoplesInHouse: peoples.value,
                        saveTarget: target.value
                    };

                    const headers = new Headers({
                        "Content-Type": "application/JSON",
                        "X-Custom-Header": "ProcessThisImmediately",
                    });

                    const body = JSON.stringify(currentboard);

                    fetch('api/board', {
                        method: 'PUT',
                        headers: headers,
                        body: body,
                        mode: 'cors'
                    }).then(
                        window.location.href = '/dashboard'
                    )
                    .catch(err => {
                        // TODO: handle
                        // controller.logError("Erro: ", err);
                    });
                })
                .catch(err => {
                    // TODO: handle
                    return;
                });
        }
    }

    view.init();

})();
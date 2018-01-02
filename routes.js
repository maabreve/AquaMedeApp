module.exports = function (app, passport, mongoose, io) {

    var Board = require('./src/models/board.js');
    var DiaryFlow = require('./src/models/diary-flow.js');

    app.use(function (req, res, next) {
        console.log('Middleware disparado........');
        next();
    });

    // views routes ===============================================================
    // DASHBOARD =========================
    app.get('/', isLoggedIn, function (req, res) {
        Board.find(function (err, board) {
            if (err)
                res.send(err);

            if (!board || (board && board.length === 0)) {
                // TODO: handle 
                res.send('Board não cadastrado');
            } else {
                if (!board[0].initialHydrometer) {
                    res.redirect('/informations');
                } else {

                    res.render('dashboard.ejs', {
                        user: req.user
                    });
                }
            }
        });
    });

    app.get('/dashboard', isLoggedIn, function (req, res) {

        Board.find(function (err, board) {
            if (err)
                res.send(err);

            if (!board || (board && board.length === 0)) {
                // TODO: handle 
                res.send('Board não cadastrado');
            } else {
                if (!board[0].initialHydrometer) {
                    res.redirect('/informations');
                } else {

                    res.render('dashboard.ejs', {
                        user: req.user
                    });
                }
            }

        });
    });

    // INFORMATIONS =========================
    app.get('/informations', isLoggedIn, function (req, res) {
        res.render('informations.ejs', {
            user: req.user
        });
    });

    // 404 =========================
    app.get('/404', function (req, res) {
        res.render('404.ejs');
    });


    // 404 =========================
    app.get('/boardNotRegistered', function (req, res) {
        res.render('boardNotRegistered.ejs');
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.render('index.ejs');
    });

    // =============================================================================
    // API ==================================================
    // =============================================================================
    app.route('/api/board/:serialNumber')
        .get(function (req, res) {
            Board.findOne({ 'serialNumber': req.params.serialNumber }, function (err, board) {
                if (err)
                    res.send(err);

                res.json(board);
            }).catch(err => {
                // TODO: handle
                console.log('Error GET /api/board - ', err);
            });
        });

    app.route('/api/board')
        .get(function (req, res) {
            Board.find(function (err, board) {
                if (err)
                    res.send(err);

                res.json(board);
            }).catch(err => {
                // TODO: handle
                console.log('Error GET /api/board - ', err);
            });
        })

        .post(function (req, res) {
            var board = new Board();
            board.serialNumber = req.body.serialNumber;
            board.macAddress = req.body.macAddress;
            board.dateBoardRegister = req.body.dateBoardRegister;

            board.save(function (error) {
                if (error)
                    res.send(error);

                res.json(board);
            });
        })

        .put(function (req, res) {

            Board.findOne({ serialNumber: req.body.serialNumber }, function (error, board) {
                if (error)
                    res.status(500).send(error);

                if (req.body.mainEmail && req.body.mainEmail !== '')
                    board.mainEmail = req.body.mainEmail;

                if (req.body.initialHydrometer && req.body.initialHydrometer !== '' && req.body.initialHydrometer !== 0)
                    board.initialHydrometer = req.body.initialHydrometer;

                if (req.body.peoplesInTheHouse && req.body.peoplesInTheHouse !== '' && req.body.peoplesInTheHouse !== 0)
                    board.peoplesInTheHouse = req.body.peoplesInTheHouse;

                if (req.body.dateUserRegister)
                    board.dateUserRegister = req.body.dateUserRegister;

                board.save(function (error) {
                    if (error)
                        res.status(500).send(error);

                    res.status(200).json(board);
                });

            });
        })

        .delete(function (req, res) {
            if (!req.body._id) {
                Board.remove(function (error) {
                    if (error)
                        res.send(error);

                    res.json({ message: 'Board excluído com Sucesso! ' });
                });
            } else {
                Board.remove({ _id: req.body._id }, function (error) {
                    if (error)
                        res.send(error);

                    res.json({ message: 'Board excluído com Sucesso! ' });
                });
            }
        });


    // water sensor
    app.route('/api/diaryflow')
        .get(function (req, res) {
            DiaryFlow.find(function (err, board) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(board);
            }).catch(err => {
                console.log('Error GET /api/board - ', err);
                res.status(500).send(err);
            });
        })

        .post(function (req, res) {
            console.log('diary flow receive ', req.body);

            io.emit('liters', req.body.liters);

            var diaryflow = new DiaryFlow();
            diaryflow.boardSerialNumber = req.body.boardSerialNumber;
            diaryflow.liters = req.body.liters;
            diaryflow.timestamp = new Date();

            diaryflow.save(function (error) {
                if (error)
                    res.status(500).send(error);

                console.log('diary flow posted', err);
                res.status(200).json(diaryflow);
            }).catch(err => {
                // TODO: handle
                console.log('Error in post diary flow', err);
            });
        })

        .delete(function (req, res) {
            DiaryFlow.remove(function (error) {
                if (error)
                    res.send(error);

                res.json({ message: 'All diary flows deleted' });
            });
        });

    app.route('/api/diaryflow/:_id')
        .get(function (req, res) {
            DiaryFlow.findById(req.body._id, function (err, board) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(board);
            }).catch(err => {
                console.log('Error GET /api/diaryflow - ', err);
            });
        })
        .delete(function (req, res) {
            DiaryFlow.remove({ _id: req.body._id }, function (error) {
                if (error)
                    res.send(error);

                res.json({ message: 'Diary flow deleted' });
            });
        });


        // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/'
        }), (req, res) => {
            loginCallback(req, res, req.user.facebook.email);
        });

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect: '/'
        }), (req, res) => {
            loginCallback(req, res, req.user.twitter.email);
        });


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/'
        }), (req, res) => {
            loginCallback(req, res, req.user.google.email);
        });

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope: ['public_profile', 'email'] }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {

        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {

        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {

        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }

    res.render('index.ejs');
}

function loginCallback(req, res, email) {
    var Board = require('./src/models/board.js');

    Board.find(function (err, board) {
        if (err)
            res.send(err);

        if (!board || (board && board.length === 0)) {
            // insert board
            var board = new Board();
            board.mainEmail = email;
            board.dateUserRegister = new Date();
            board.initialHydrometer = req.body.initialHydrometer;
            board.peoplesInTheHouse = req.body.peoplesInTheHouse;

            board.save(function (error) {
                if (error)
                    res.send(error);

                res.redirect('/informations');
            });
            x

        } else {
            if (!board[0].initialHydrometer) {
                res.redirect('/informations');
            } else {
                res.redirect('/dashboard');
            }
        }
    });
}
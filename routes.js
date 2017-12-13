module.exports = function (app, passport, mongoose) {

    var Board = require('./src/models/board.js');

    app.use(function (req, res, next) {
        console.log('Middleware disparado........');
        next();
    });

    // normal routes ===============================================================
    // HOME PAGE
    app.get('/', isLoggedIn, function (req, res) {

        Board.find(function (err, board) {
            if (err)
                res.send(err);

            if (!board || (board && board.length === 0)) {
                // TODO: handle 
                res.send('Board não cadastrado');
            } else {
                if (!board[0].initialRegister) {
                    res.redirect('/informations');
                } else {
                    res.render('dashboard.ejs', {
                        user: req.user
                    });
                }
            }

        });
    });

    // DASHBOARD =========================
    app.get('/dashboard', isLoggedIn, function (req, res) {

        Board.find(function (err, board) {
            if (err)
                res.send(err);

            if (!board || (board && board.length === 0)) {
                // TODO: handle 
                res.send('Board não cadastrado');
            } else {
                if (!board[0].initialRegister) {
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

    // NOT CONNECTED =========================
    app.get('/offline', function (req, res) {
        res.render('offline.ejs', {
            user: req.user
        });
    });

    // 404 =========================
    app.get('/404', function (req, res) {
        res.render('404.ejs', {
            user: req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.render('index.ejs');
    });

    // API
    app.route('/api/board')
        .post(function (req, res) {
            var board = new Board();
            board.code = req.body.code;
            board.counter = req.body.counter;
            board.counterMonth = req.body.counterMonth;

            board.save(function (error) {
                if (error)
                    res.send(error);

                res.json(board);
            });
        })

        .get(function (req, res) {
            Board.find(function (err, board) {
                if (err)
                    res.send(err);

                res.json(board);
            });
        })

        .put(function (req, res) {
            Board.findById(req.body._id, function (error, board) {

                if (error)
                    res.send(error);

                if (req.body.initialRegister && req.body.initialRegister !== '')
                    board.initialRegister = req.body.initialRegister;

                if (req.body.currentRegister && req.body.currentRegister !== '')
                    board.currentRegister = req.body.currentRegister;

                if (req.body.peoplesInHouse && req.body.peoplesInHouse !== '')
                    board.peoplesInHouse = req.body.peoplesInHouse;

                if (req.body.saveTarget && req.body.saveTarget !== '')
                    board.saveTarget = req.body.saveTarget;

                board.save(function (error) {
                    if (error)
                        res.send(error);

                    res.json(board);
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
            Board.find(function (err, board) {
                if (err)
                    res.send(err);

                if (!board || (board && board.length === 0)) {
                    // insert board
                    var board = new Board();
                    board.email = req.user.facebook.email;
                    board.code = 'B1';
                    board.dateRegister = new Date();

                    board.save(function (error) {
                        if (error)
                            res.send(error);

                        res.redirect('/informations');
                    });


                } else {
                    if (!board[0].initialRegister) {
                        res.redirect('/informations');
                    } else {
                        res.redirect('/dashboard');
                    }
                }
            });
        });

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect: '/'
        }), (req, res) => {
            Board.find(function (err, board) {
                if (err)
                    res.send(err);

                if (!board || (board && board.length === 0)) {
                    // insert board
                    var board = new Board();
                    board.email = req.user.facebook.email;
                    board.code = 'B1';
                    board.dateRegister = new Date();

                    board.save(function (error) {
                        if (error)
                            res.send(error);

                        res.redirect('/informations');
                    });


                } else {
                    if (!board[0].initialRegister) {
                        res.redirect('/informations');
                    } else {
                        res.redirect('/dashboard');
                    }
                }
            });
        });


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/'
        }), (req, res) => {
            Board.find(function (err, board) {
                if (err)
                    res.send(err);

                if (!board || (board && board.length === 0)) {
                    // insert board
                    var board = new Board();
                    board.email = req.user.facebook.email;
                    board.code = 'B1';
                    board.dateRegister = new Date();

                    board.save(function (error) {
                        if (error)
                            res.send(error);

                        res.redirect('/informations');
                    });


                } else {
                    if (!board[0].initialRegister) {
                        res.redirect('/informations');
                    } else {
                        res.redirect('/dashboard');
                    }
                }
            });
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
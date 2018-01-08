module.exports = function (app, passport, mongoose, io) {

    var Board = require('./src/models/board.js');
    var CFlow = require('./src/models/cflow.js');
    var Counter = require('./src/models/counters.js');

    app.use(function (req, res, next) {
        console.log('Middleware disparado........');
        next();
    });

    // views routes ===============================================================
    // dashboard =========================
    app.get('/', isLoggedIn, function (req, res) {
        res.render('dashboard.ejs', {
            user: req.user
        });
    });

    app.get('/dashboard', isLoggedIn, function (req, res) {
        res.render('dashboard.ejs', {
            user: req.user
        });
    });

    // informations =========================
    app.get('/informations', isLoggedIn, function (req, res) {
        res.render('informations.ejs', {
            user: req.user
        });
    });

    // 404 =========================
    app.get('/404', function (req, res) {
        res.render('404.ejs');
    });

    // not registered =========================
    app.get('/boardNotRegistered', function (req, res) {
        res.render('boardNotRegistered.ejs');
    });

    // logout ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.render('index.ejs');
    });

    // =============================================================================
    // API ==================================================
    // =============================================================================
    app.route('/api/board')
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

                    res.status(200).json({ message: 'Board excluído com Sucesso! ' });
                });
            } else {
                Board.remove({ _id: req.body._id }, function (error) {
                    if (error)
                        res.send(error);

                    res.status(200).json({ message: 'Board excluído com Sucesso! ' });
                });
            }
        });

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


    app.route('/api/counter')
        .get(function (req, res) {
            Counter.find(function (err, flow) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(flow);
            }).catch(err => {
                console.log('Error GET /api/board - ', err);
                res.status(500).send(err);
            });
        })
        .put(function (req, res) {
            console.log('counter update fired!!! ', req.body);


            var counters = {
                diary: req.body.diaryCounter,
                monthly: req.body.monthlyCounter
            };

            io.emit(req.body.serialNumber, counters);

            Counter.findOne({ serialNumber: req.body.serialNumber }, function (err, counter) {
                if (err)
                    res.status(500).send(err);

                if (!counter) {
                    let newcounter = new Counter();
                    newcounter.serialNumber = req.body.serialNumber;
                    newcounter.diaryCounter = req.body.diaryCounter;
                    newcounter.monthlyCounter = req.body.monthlyCounter;
                    newcounter.save();

                    console.log('counter inserted ', newcounter);
                } else {
                    counter.diaryCounter = req.body.diaryCounter;
                    counter.monthlyCounter = req.body.monthlyCounter;
                    counter.save();

                    console.log('counter updated ', counter);

                }

                res.status(200).json(counter);
            });
        })
        .delete(function (req, res) {
            Counter.remove(function (error) {
                if (error)
                    res.send(error);

                res.status(200).json({ message: 'Counters excluídos com Sucesso! ' });
            });
        });


    app.route('/api/counter/:serialNumber')
        .get(function (req, res) {
            Counter.find({ serialNumber: req.params.serialNumber }, function (err, flow) {
                if (err)
                    res.status(500).send(err);

                res.status(200).json(flow);
            }).catch(err => {
                console.log('Error GET /api/board - ', err);
                res.status(500).send(err);
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


    // google -------------- -------------------

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
        } else {
            if (!board[0].initialHydrometer) {
                res.redirect('/informations');
            } else {
                res.redirect('/dashboard');
            }
        }
    });
}
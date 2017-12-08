// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '145504816098814', // your App ID
        'clientSecret'    : '96464812693dd35d67cbaa41fbd88837', // your App Secret
        'callbackURL'     : 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields'   : ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'twitterAuth' : {
        'consumerKey'        : 'AkNkew7ggXnuG6QGYg91x4CMX',
        'consumerSecret'     : 'ZyJ9yiuN6CIfswtYFd9TsXkqNYMXI1xpA3aRJbPem6t2fpHyPZ',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '1055154494916-ll08ev5uiqo9b7ksdacai7fbfvi3u1ao.apps.googleusercontent.com',
        'clientSecret'     : 'l_T9obddybIiwaqjeYhrXKIi',
        'callbackURL'      : 'http://localhost:8080/auth/google/callback'
    }

};

/**
 * Created by superMoon on 2016-08-17.
 */

module.exports = {
    db: 'mongodb://localhost/mean-book',
    sessionSecret: 'developmentSessionSecret',
    facebook: {
        clientID: '322607054739138',
        clientSecret: '7d2a694ce2201fc47ee8aa2fde191a3d',
        callbackURL: 'http://localhost:3000/oauth/facebook/callback'
    },
    twitter: {
        clientID: '',
        clientSecret: '',
        callbackURL: 'http://localhost:3000/oauth/twitter/callback'
    }
};

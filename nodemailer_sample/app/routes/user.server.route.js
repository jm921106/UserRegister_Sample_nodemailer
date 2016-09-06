/**
 * Created by superMoon on 2016-08-16.
 */

var users = require('../../app/controllers/user.server.controller');
// var mail = require('../../app/controllers/mail.server.controller');
var passport = require('passport');

module.exports = function (app) {
    app.route('/signup')
        .get(users.renderSignup)
        .post(users.signup);

    // 로그인
    app.route('/signin')
        .get(users.renderSignin)
        .post(passport.authenticate('local', {
            successRedirect : '/',
            failureRedirect : '/signin',
            failureFlash : true
        }));

    app.get('/signout', users.signout);
    
    app.get('/sendMail', users.sendMail);
    
    app.post('/active', users.active);

    app.get('/goToMain', users.goToMain);
}
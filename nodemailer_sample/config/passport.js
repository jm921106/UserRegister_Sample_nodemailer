/**
 * Created by superMoon on 2016-08-16.
 */

var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function() {
    var User = mongoose.model('User');

    //serializeUser 사용자 직렬화를 다루는 방식을 정의하기 위해 사용 - passport는 세션에 사용자 _id를 저장
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // 추후에 _id를 통해 DB에서 user객체를 가져올 것, password와 salt속성을 가져오지 않게 보증하기 위해 필드 옵션을 사용하는 방식에 주목.
    passport.deserializeUser(function (id, done) {
        User.findOne({
            _id : id
        }, '-password -salt', function (err, user) {
            done(err, user);
        });
    });

    require('./strategies/local.js')();
};


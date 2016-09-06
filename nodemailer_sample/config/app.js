var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var compress = require("compression");
var methodOverride = require("method-override");
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

module.exports = function () {
    var app = express();

    if (process.env.NODE_ENV === 'development') {
        app.use(logger('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(flash());

    app.use(session({
        saveUninitialized : true,
        resave : true,
        secret : config.sessionSecret
    }));

    // view engine setup
    app.set('views', path.join(__dirname, '../app/views'));
    app.set('view engine', 'ejs');

    app.use(passport.initialize()); // 패스포트 모듈을 부트스트래핑
    app.use(passport.session()); // 사용자 세션을 추적

    require('../app/routes/index.server.route.js')(app);
    require('../app/routes/user.server.route.js')(app);

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    
    return app;
};


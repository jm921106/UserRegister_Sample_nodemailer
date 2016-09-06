/**
 * Created by superMoon on 2016-08-16.
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose'),
    express = require('./config/app'),
    passport = require('./config/passport');

var db = mongoose();

var app = express();

var passport = passport();

app.listen(3000);

module.exports = app;

console.log('Server running at http://localhost:3000/');


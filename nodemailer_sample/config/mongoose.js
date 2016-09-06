/**
 * Created by superMoon on 2016-08-16.
 */
var config = require('./config');
var mongoose = require('mongoose');

module.exports = function() {
    var db = mongoose.connect(config.db);
    
    require('../app/models/User');
    require('../app/models/AuthNum');
    
    return db;
};


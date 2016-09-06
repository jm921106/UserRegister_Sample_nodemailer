/**
 * Created by superMoon on 2016-08-16.
 */


exports.render = function(req, res) {
    
    res.render('index', {
        title : 'This is Index Page.',
        userFullName : req.user ? req.user.fullName : ''
    });
};
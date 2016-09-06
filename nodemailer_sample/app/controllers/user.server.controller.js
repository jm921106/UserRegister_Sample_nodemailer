
// npm
var passport = require('passport');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var EmailTemplates = require('swig-email-templates');
var hat = require('hat');

// mongoose
var User = require('mongoose').model('User');
var AuthNum = require('mongoose').model('AuthNum');


var getErrorMessage = function (err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists !';
                break;
            default :
                message = 'Something went wrong !';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};

// 로그인 페이지 render
exports.renderSignin = function (req, res, next) {
    if (!req.user) {
        res.render('signin', {
            title: 'Sign-in Form',
            messages: req.flash('error') || req.flash('info')
        });
    } else {
        return res.redirect('/');
    }
};


// 회원가입 페이지 render
exports.renderSignup = function (req, res, next) {
    if (!req.user) {
        res.render('signup', {
            title: 'Sign-up Form',
            messages: req.flash('error')
        });
    } else {
        return res.redirect('/');
    }
};


// 회원가입
exports.signup = function (req, res, next) {
    if (!req.user) {
        var user = new User(req.body);
        var message = null;

        user.provider = 'local';

        user.save(function (err) {
            if (err) {
                var message = getErrorMessage(err);

                req.flash('error', message);
                return res.redirect('/signup');
            }
            req.login(user, function (err) {
                if (err) return next(err);
                return res.redirect('/');
            });
        }); // save

    } else {
        return res.redirect('/');
    }
};


// 아이디 활성화하기
exports.active = function (req, res) {

    // 유입경로를 확인 test
    // console.log("req.headers : ");
    // console.log(req.headers);
    // console.log("req.headers.referer : ");
    // console.log(req.headers.referer);
    
    // console.log("req.ip : ");
    // console.log(req.ip);

    // username과 인증번호를 비교한다
    AuthNum.findOne({username: req.body.username}, function (err, data) {
        if (err) {
            console.log("AuthNum findOne에서 발생한 err " + err);
        }
        
        if (data.authNum == req.body.random) { // 인증완료

            // active == false 로 수정 (활성화 false)
            AuthNum.update({username: data.username}, {$set: {active: false}}, function (err, updateDate) {

                // 인증하기 username 확인하고 그 계정의 active 활성화를 true로 변경해준다.
                User.update({username : req.body.username}, {$set: {active: true}}, function (err, task) {
                    console.log("user active 변경완료 ! false >>> true 활성화된 계정으로 변경");
                    res.redirect('/');
                });
            });

        } else { // 인증 실패
            
            // 메세지 전달 "활성화가 되있지 않습니다."

            res.redirect('/');
        }
    });
}

// 접근권한 확인하기 ! true면 가지고 false면 안가지고 !
exports.goToMain = function (req, res) {

    if(req.user.active == false) {
        // 비활성화 메세지 전달하기 ~~~
        
        res.redirect('/');
    } else { // 활성화 됬을 경우
        
        res.render('main', {
            username: req.user.fullName
        });
    }
};


exports.sendMail = function (req, res) {

    // SMTP mail 보내기
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: "jm921106",
            pass: "wjdans92"
        }
    }));

    //create template renderer
    var templates = new EmailTemplates();

    // provide custom rendering function
    var sendPwdReminder = transporter.templateSender({
        render: function (context, callback) {

            templates.render('../../../app/views/authMail.html', context, function (err, html, text) {
                if (err) {
                    return callback(err);
                }
                callback(null, {
                    subject: 'Welcome to Logicong !', // mail 제목
                    html: html, // html
                    text: text // text
                });
            });
        }
    }, {
        from: '"Logicong Service" <jm921106@gmail.com>'
    });

    User.findOne({username: req.user.username}, function (err, task) {
        if (err) {
            console.log("User findOne 하다가 발생한 에러" + err);
        }

        // var random = Math.floor(Math.random() * 1000000);
        // console.log(random);
        var random = hat();
        console.log("hat : " + random);

        //db에 일시저장 - username의 이름을 찾고 만약 있으면 수정 없으면 추가
        var data = {
            username: task.username,
            authNum: random,
            active: true
        }

        AuthNum.find({username: task.username}, function (err, findData) {
            if (findData.length == 0) { // 없다
                // insert
                new AuthNum(data).save();

            } else { // 있다
                // update
                AuthNum.update({username: task.username}, {$set: {authNum: random}}, function (err, updateData) {
                    if (err) {
                        console.log("auth num update 에서 발생한 err : " + err);
                    }
                });
            }
        });

        sendPwdReminder({
            // to
            to: task.email
        }, {
            // 보내는 데이터
            username: task.username,
            random: random
        }, function (err, info) {
            if (err) {
                console.log('Error : ' + err);
            } else {
                console.log('main send ! success !');
            }
        });

        res.redirect('/');

    });
} // exports


// 로그아웃
exports.signout = function (req, res) {
    req.logout();
    res.redirect('/');
};

// 추후에 passport 다른 전략을 이용할 때 사용 , facebook , twitter 등등
exports.saveOAuthUserProfile = function (req, profile, done) {
    User.findOne({
        provider: profile.provider,
        providerId: profile.providerId
    }, function (err, user) {
        if (err) {
            return done(err);
        } else {
            if (!user) {
                var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '' );

                User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
                    profile.username = availableUsername;

                    user = new User(profile);

                    user.save(function (err) {
                        if (err) {
                            var message = _this.getErrorMessage(err);

                            req.flash('error', message);
                            return res.redirect('/signup');
                        }

                        return done(err, user);
                    });
                });
            } else {
                return done(err, user);
            }
        }
    });
};

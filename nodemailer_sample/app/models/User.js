/**
 * Created by superMoon on 2016-08-16.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName : String,
    lastName : String,
    email : {
        type : String,
        match : [/.+\@.+\..+/, "Please fill a valid e-mail address"]
    },
    username : {
        type : String,
        unique : true,
        required : 'Username is required',
        trim : true
    },
    password : {
        type: String,
        validate: [
            function (password) {
                return password && password.length > 6;
            }, 'Password should be longer'
        ]
    },
    active : {
        type : Boolean,
        default : false
    },
    // 암호를 해시하기 위해 사용하는 salt속성
    salt : {
        type : String
    },
    // local , facebook , twitter 등등
    provider : {
        type : String,
        required : 'Provider is required'
    },
    // 인증전략을 위한 사용자 식별자를 지시
    providerId : String,
    // Oauth 공급자로부터 인출한 사용자 객체를 저장하기 위해 나중에 사용할
    providerData : {},
    created : {
        type : Date,
        default : Date.now
    }
});

// make full name
UserSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
}).set(function (fullName) {
    var splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1]  || '';
});

// mongoose save
UserSchema.pre('save', function (next) {
    // 사용자의 password를 해시함
    // 1단계 - 자동으로 생성된 난수 해시 솔트를 만들고
    // 2단계 - 현재 사용자의 비밀번호를 hashPassword() 인스턴스 메소드를 사용해 해시로 처리된 비밀번호로 치환
    if(this.password) {
        this.salt = new Buffer (crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

// 노드의 crypto 모듈을 활용해서 비밀번호를 문자열을 해시 하기 위해 사용
UserSchema.methods.hashPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

// 문자열 인수를 받아들여 해시하고 현재 해시와 비교
UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

// findUniqueUsername
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username : possibleUsername
    }, function(err, user) {
        if(!err) {
            if(!user) {
                callback (possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

UserSchema.set('toJSON', {
    getters : true,
    virtuals : true
});

mongoose.model('User', UserSchema);
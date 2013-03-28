
/*
 * GET users listing.
 */

var configFile = require('../config'),
    crypto = require('crypto'),
    util = require('util');

var db = configFile.database,
    config = configFile.config;

exports.login = function(req, res){
    if (req.method == 'GET')  {
        res.render('login', {title: "登录到NodeExchange账户"});
    } else {

        res.render('login', {title: "登录到NodeExchange账户", error: "账号或者密码错误"});
    }
};

exports.auth = function(req, res, next) {
    console.log('check is login');
    next();
};

exports.register = function(req, res){
    var resultObj = {
        title: "注册新账户"
    };

    if (req.method == 'GET') {
        res.render('register', resultObj);

        console.log(db);

    } else {
        var phone = req.body.phone,
            email = req.body.email.toLowerCase(),
            pwd = req.body.password,
            rePwd = req.body.rePassword;

        var fail = false;

        if (!/^1\d{10}$/.test(phone)) {
            fail = true;
            resultObj.error = "手机号格式不正确";
        } else if (pwd !== rePwd) {
            fail = true;
            resultObj.error = "两次输入密码不同";
        } else if(pwd.length < 6) {
            fail = true;
            resultObj.error = "密码长度不足6位";
        } 

        if (fail) {
            res.render('register', resultObj);
            return;
        }

        db.user.findOne({email: email}, function(err, email_result) {
            if (name_result == null) { //邮箱未被注册
                db.user.findOne({phone: phone}, function(err, phone_result) {
                    if (name_result == null) { //手机号未被注册
                        var sha1Sum = crypto.createHash('sha1');
                        db.user.insert({
                            email : email,
                            phone: phone,
                            password: sha1Sum.update(password),
                            regTime: util.getUTC8Time("YYYY-MM-DD HH:mm:ss")
                        }, function(err, user) {
                            if (!err && user) {
                                res.redirect('/');
                            } else {
                                resultObj.error = "注册失败，数据库原因";  
                            }
                        });
                    } else {
                        resultObj.error = "手机号码已经被注册";
                        res.render('register', resultObj);
                    }
                });
            } else {
                resultObj.error = "邮箱已经被注册";
                res.render('register', resultObj);
            }
        });






    }
};

exports.forgot = function(req, res){
     if (req.method == 'GET') {
        res.render('forgot', {title: "找回密码"});
    } else {
        var email = req.body.email;

        res.render('forgot', {title: "找回密码", error: "未找到此邮箱对应的账号"});
    }
};

exports.profile = function(req, res){
    res.send("respond with profile page");
};

exports.showUser = function(req, res){
    res.send("respond with all ads about this user");
};
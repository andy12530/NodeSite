
/*
 * GET users listing.
 */

var configFile = require('../config'),
    crypto = require('crypto'),
    util = require('util');

var dateFormat = require('dateformat');

var db = configFile.database,
    config = configFile.config;


exports.logout = function(req, res) {
    delete res.locals.userInfo;
    req.session.destroy();
    res.clearCookie('email', {path:'/' });
    res.clearCookie('secure', {path: '/'});
    return res.redirect("/");
}


exports.login = function(req, res){
    if (req.method == 'GET')  {
        delete res.locals.userInfo;
        req.session.destroy();
        res.clearCookie('email', {path:'/' });
        res.clearCookie('secure', {path: '/'});
        res.render('login', {title: "登录到NodeExchange账户"});

    } else {
        var email = req.body.email,
            pwd = req.body.password,
            remember = req.body.rememberPwd;

        var truePwd = crypto.createHash('sha1').update(pwd).digest('base64');

        db.collection('user').findOne({email: email, password: truePwd}, function(err, result) {
            if (!err && result) {
                req.session.user = result;

                var cookieHash = crypto.createHash('md5').update(result.phone + result.email).digest('base64');
                res.cookie('secure', cookieHash, {path: '/', httpOnly: true});
                res.cookie('email', email, {path: '/', httpOnly: true});
                res.cookie('myId', result._id+"", {path: '/', httpOnly: true});
                req.session.cookie.expires = new Date(Date.now() + 432000); //auto login in 5 days 
                return res.redirect("/");
            } else {
                res.render('login', {title: "登录到NodeExchange账户", error: "账号或者密码错误"});
            }
        });
    }
};

exports.auth = function(req, res, next) {
    if (req.session.user) {
        res.locals.userInfo = req.session.user;
        next();
    } else {
        if (req.cookies.email && req.cookies.secure) {
            var email = req.cookies.email,
                hashCookie = req.cookies.secure;
                db.collection('user').findOne({email: email}, function(err, result) {
                    if (!err && result) {
                        var trueHashCookie = crypto.createHash('md5').update(result.phone + result.email).digest('base64');
                        if (trueHashCookie == hashCookie) {
                            req.session.user = result;
                            res.locals.userInfo = req.session.user;
                            req.session.cookie.expires = new Date(Date.now() + 432000); //auto login in 5 days 
                            return next();
                        }
                    }
                });
        } else {
           next(); 
        }
    }
};

exports.register = function(req, res){
    var renderObj = {
        title: "注册新账户"
    };

    if (req.method == 'GET') {
        res.render('register', renderObj);
    } else {
        var phone = req.body.phone,
            email = req.body.email.toLowerCase(),
            pwd = req.body.password,
            rePwd = req.body.rePassword;

        var fail = false;

        if (!/^1\d{10}$/.test(phone)) {
            fail = true;
            renderObj.error = "手机号格式不正确";
        } else if (pwd !== rePwd) {
            fail = true;
            renderObj.error = "两次输入密码不同";
        } else if(pwd.length < 6) {
            fail = true;
            renderObj.error = "密码长度不足6位";
        } 

        if (fail) {
            res.render('register', renderObj);
            return;
        }

        db.collection('user').findOne({email: email}, function(err, email_result) {
            if (email_result == null) { //邮箱未被注册
                db.collection('user').findOne({phone: phone}, function(err, phone_result) {
                    if (phone_result == null) { //手机号未被注册
                        var date = new Date(),
                            truePwd = crypto.createHash('sha1').update(pwd).digest('base64');
                            cookieHash = crypto.createHash('md5').update(phone + email).digest('base64');

                        db.collection('user').insert({
                            email : email,
                            phone: phone,
                            password: truePwd,
                            regTime: date.getTime()
                        }, function(err, user) {
                            if (!err && user) {
                                req.session.user = user[0];
                                res.cookie('secure', cookieHash, {path: '/', httpOnly: true});
                                res.cookie('email', email, {path: '/', httpOnly: true});
                                res.cookie('myId', result._id+"", {path: '/', httpOnly: true});
                                req.session.cookie.expires = new Date(Date.now() + 432000);

                                return res.redirect('/');
                            } else {
                                renderObj.error = "注册失败，数据库原因";  
                            }
                        });
                    } else {
                        renderObj.error = "手机号码已经被注册";
                        res.render('register', renderObj);
                    }
                });
            } else {
                renderObj.error = "邮箱已经被注册";
                res.render('register', renderObj);
            }
        });
    }
};

exports.forgot = function(req, res){
    var renderObj = {
        title: '找回密码'
    };
    if (req.method == 'GET') {
        res.render('forgot', renderObj);
    } else { 
        var email = req.body.email;
        db.collection('user').findOne({email: email}, function(err, email_result) {
            if (email_result) {
                renderObj.success = "the email has send your registe's email";
            } else {
                renderObj.error = "未找到此邮箱对应的账号";
            }
            
            return res.render('forgot', renderObj); 
        });
    }
};

exports.profile = function(req, res){
    if (req.method == 'GET') {
        if (!req.session.user) {
            return res.redirect('/login');
        } else {
            var user = req.session.user,
                userId = user._id;
            var publicAds = [], deleteAds = [];

            db.collection('post').find({userId: userId}, {sort:[['createTime', -1]]}).toArray(function(err, ads) {
                if (!err) {
                    ads.forEach(function(item) {
                        item.createTime = dateFormat(item.createTime, 'mm月dd HH:MM');
                        if (item.status == 'ok') {
                            publicAds.push(item);
                        } else {
                            deleteAds.push(item);
                        }
                    });
                    var renderObj = {
                        title: '个人中心',
                        publicAds: publicAds,
                        deleteAds: deleteAds
                    };
                    res.render('profilePost', renderObj);
                } else {
                    return next();
                }
            });
        }
        
    }
};

exports.likeAds = function(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        var user = req.session.user;
        var renderObj = {
            title: '收藏帖子'
        }

        if(user.likePostId) {
            var likeAdId = user.likePostId;
             db.collection('post').find({'postId': {$in: likeAdId}}).toArray(function(err ,rs) {
                if (!err && rs) {
                    renderObj.postData = rs;
                } 
                res.render('likeAds', renderObj);
             });
        } else {
            res.render('likeAds', renderObj);
        }
    }
};



exports.password = function(req, res) {
    if (req.method == 'GET') {
        res.render('changePwd', {title: '修改密码'});
    } else {
        if (!req.session.user) {
            return res.redirect('/login');
        } else {
            var renderObj = {
                title : '修改密码'
            }

            var oldPwd = req.body.oldPassword,
                newPwd = req.body.newPassword,
                rePwd = req.body.rePassword;

            if (!oldPwd || newPwd !== rePwd) {
                renderObj.info = '原始密码不能为空，且两次新密码须一致';
                return res.render('changePwd', renderObj);
            }

            var user = req.session.user;
            var truePwd = crypto.createHash('sha1').update(oldPwd).digest('base64');

            if (user.password != truePwd) {
                renderObj.info = '原始密码错误';
                return res.render('changePwd', renderObj);
            }

            var newTruePwd = crypto.createHash('sha1').update(newPwd).digest('base64'),
                userId = db.ObjectID.createFromHexString(user._id);

            db.collection('user').update({_id: userId}, {$set: {password: newTruePwd}}, function(err, rs) {
                if (!err && rs) {
                    user.password = newTruePwd;
                    renderObj.info = '修改成功';
                } else {
                    renderObj.info = '修改失败';
                }

                return res.render('changePwd', renderObj);
            });
        }
    }
};

exports.showUser = function(req, res){
    res.send("respond with all ads about this user");
};
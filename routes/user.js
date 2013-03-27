
/*
 * GET users listing.
 */

exports.login = function(req, res){
    res.send("respond with login page");
};

exports.auth = function(req, res, next) {
    console.log('check is login');
    next();
};

exports.register = function(req, res){
    res.send("respond with register page");
};

exports.forgot = function(req, res){
    res.send("respond with forgot page");
};

exports.profile = function(req, res){
    res.send("respond with profile page");
};

exports.showUser = function(req, res){
    res.send("respond with all ads about this user");
};
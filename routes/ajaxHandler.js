

var configFile = require('../config');
var db = configFile.database;
var memcache = configFile.memcache;
memcache.connect();

// show the second category
exports.secondCat = function(req, res) {
    var firstCatId = req.query.firstCatId;
    memcache.get("secondCat" + firstCatId, function(err ,result) {
        console.log(result);
        if (!err && result) {
            result = JSON.parse(result);
            return res.json(result);
        } else {
            db.collection('category').find({firstCatId: firstCatId}).toArray(function(err, result) {
                if (err || !result) {
                    result = null;
                }
                var cacheRs = JSON.stringify(result);
                memcache.set("secondCat" + firstCatId, cacheRs, function() {
                    console.log("set cache");
                }, 3600);
                return res.json(result);
            });  
        }
    });
};


exports.likeAd = function(req, res) {
    var postId = req.params.postId;
    var user = req.session.user;

    var result = {status: "fail"};
    var baseObj = {likePostId: postId};

    if (user) {
         db.collection('user').update({_id: user._id}, {$push: baseObj}, function(err, rs) {
            if(!err && rs) {
                result.status = "success";
                delete req.session.user;
            }

            return res.json(result);
         });
    } else {
        return res.json(result);
    }

}


exports.unlikeAd = function(req, res) {
    var postId = req.params.postId;
    var user = req.session.user;

    var result = {status: "fail"};
    var baseObj = {likePostId: postId};

    if (user) {
         db.collection('user').update({_id: user._id}, {$pull: baseObj}, function(err, rs) {
            if(!err && rs) {
                result.status = "success";
                delete req.session.user;
            }

            return res.json(result);
         });
    } else {
        return res.json(result);
    }
}
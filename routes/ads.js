/*
 * About the ads.
 */
var configFile = require('../config');
var db = configFile.database;
var _ = require('underscore');

exports.create = function(req, res) {
    if (req.method == 'GET') {
        /*db.collection('postId').save({name:"post", id:523627970}, function(err, result) {

        });

        db.collection('postId').find().toArray(function(err, result) {
            console.log(result);
        })*/

        db.collection('category').find({deep: 'first'}).toArray(function(err, result) {
            if(!err && result) {
                res.render('create', {title: '发布新信息', result: result});
            } 
        });    
    } else {
        if (! req.session.user) {
            return res.redirect('/login');
        }

        var title = req.body.title,
            address = req.body.address,
            contact = req.body.contact,
            detail = req.body.detail,
            secondCatId = req.body.secondCatId,
            postType = req.body.adType;

        if (!title || !address || !contact || !detail || !secondCatId || !postType) {
            return res.send('表单某一项丢失');
        }


        var date = new Date();
        var baseObj = {
            createTime: date.getTime(),
            phone: req.session.user.phone,
            userId: req.session.user._id,
            status: 'ok',
        }

        _.extend(baseObj, req.body);
        
        db.collection('category').findOne({_id:db.ObjectID.createFromHexString(secondCatId) }, function(err, result) {
            if (!err, result) {
                var secondCatData = result;
                db.collection('postId').findAndModify({"name":"post"}, {}, {$inc:{'id':1}}, function(err, result) {
                    if(!err || result) {
                        baseObj.postId = result.id + ""; //mongodb需要转换为int才能查询
                        baseObj.url = '/'+secondCatData.categoryEnglish+'/' + baseObj.postId; 
                        db.collection('post').insert(baseObj, function(err, ads) {
                            if (!err || ads) {
                                res.redirect(baseObj.url);
                            } else {
                                res.send('发布失败');
                            }
                        });

                   } else {
                        console.log('mongoDB 没有从postID中拿到ID');
                   } 
                });  
            } else {
                res.send('不存在的分类目录');
            }
        });
    }
};

exports.showAd = function(req, res) {
    if (req.method =="GET") {
        var postId = req.params.postId,
            secondCatEnglish = req.params.category;

        db.collection('post').findOne({postId: postId}, function(err, result) {
            if (!err || result) {
                var postData = result;
                postData.isAuthor = false;
                if (req.session.user && req.session.user._id == postData.userId) {
                    postData.isAuthor = true;
                }
                db.collection('category').find({
                    '_id': {
                        "$in" : [
                            db.ObjectID.createFromHexString(postData.firstCatId),
                            db.ObjectID.createFromHexString(postData.secondCatId)
                        ]
                    }}).toArray(function(err, result) {
                        if (!err || result) {
                            //将json转为obj
                            result[1].metas = JSON.parse(result[1].metas);

                            //相关帖子
                            // to 优化和删除 当前的帖子，限制为5条以内
                            db.collection('post').find({
                                'userId': postData.userId
                            }).limit(5).toArray(function(err, relateAds) {
                                if(!err && relateAds) {
                                    console.log(relateAds);
                                    var renderObj = {
                                        postData: postData,
                                        firstCategory: result[0],
                                        secondCategory: result[1],
                                        relateAds: relateAds || null
                                    }
                                    res.render('ad', renderObj);
                                }
                            });
                        } else {
                            return res.sender('没有这个帖子的相关类目信息')
                            //没有查到这个帖子的相关类目信息
                        }
                });
            } else {
                //没有这个ID
                // 404 页面
                return next();
            }
        });
    }
};

exports.deleteAd = function(req, res) {
    res.send('delete a ads');
};

exports.editAd = function(req, res) {
    res.send('edit a ads');
};



/*
 * About the ads.
 */
var configFile = require('../config');
var db = configFile.database;
var dateFormat = require('dateformat');
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
                                'userId': postData.userId,
                                '_id': {
                                    "$ne": postData._id
                                }
                            }).limit(5).toArray(function(err, relateAds) {
                                if(!err && relateAds) {
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
    if(req.method == "GET") {
        var postId = req.params.postId;
        db.collection('post').remove({postId: postId}, function(err, result) {
            console.log('删除成功');
        });
    }
};

exports.editAd = function(req, res) {
    var postId = req.params.postId;
    /*db.collection('post').findOne({postId: postId}, function(err, result) {
        if (!err && result) {
            var postData = result;
            if (req.session.user && req.session.user._id == result.userId) {
                db.collection('category').find({deep: 'first'}).toArray(function(err, result) {
                    if(!err && result) {
                        var renderObj = {
                            isEdit: true,
                            postData: postData,
                            result: result
                        }
                        console.log(result);
                        res.render('create', renderObj);
                    } 
                });
            }
        }
        
    });*/
};

exports.listAds = function(req, res) {
    var category = req.params.category;
    db.collection('category').findOne({'categoryEnglish': category}, function(err, result) {
        if (!err && result) {
            var query = {},
                relateCatQuery = {};

            var categoryId = result._id +"";

            if (result.deep == 'first') {
                query.firstCatId = categoryId;
                relateCatQuery.firstCatId = categoryId;
            } else {
                query.secondCatId = categoryId;
                relateCatQuery.firstCatId = result.firstCatId +"";
            }

            db.collection('post').find(query).limit(200).toArray(function(err, ads) {
                if (!err && ads) {
                    ads.forEach(function(item) {
                        item.createTime = dateFormat(item.createTime, 'mm月dd HH:MM');
                    });
                    db.collection('category').find(relateCatQuery).toArray(function(err, relateCats) {
                        if(!err) {
                            var renderObj = {
                                title: result.category,
                                ads: ads,
                                relateCats: relateCats || null
                            }
                        }
                        console.log(renderObj);
                        return res.render('category', renderObj);

                    });
                }

            });

        } else {
            //404页面
            next();
        }
    })

};

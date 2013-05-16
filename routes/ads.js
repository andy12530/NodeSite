/*
 * About the ads.
 */
var configFile = require('../config');
var db = configFile.database;
var dateFormat = require('dateformat');
var _ = require('underscore');
var md = require("node-markdown").Markdown;
var memcache = configFile.memcache;
memcache.connect();

exports.create = function(req, res) {
    if (req.method == 'GET') {
/*        db.collection('postId').save({name:"post", id:523627970}, function(err, result) {

        });

        db.collection('postId').find().toArray(function(err, result) {
            console.log(result);
        })*/
        
        memcache.get("firstCategoryInfo", function(err ,result) {
            if (!err && result) {
                console.log("cache");
                result = JSON.parse(result);
                res.render('create', {title: '发布新信息', result: result});
            } else {
                db.collection('category').find({deep: 'first'}).toArray(function(err, result) {
                    if(!err && result) {
                        var cacheRs = JSON.stringify(result);
                        memcache.set("firstCategoryInfo", cacheRs, function() {
                            console.log("set cache");
                        }, 3600 * 24);
                        res.render('create', {title: '发布新信息', result: result});
                    } 
                });
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
                        next();
                   } 
                });  
            } else {
                res.send('不存在的分类目录');
            }
        });
    }
};

exports.showAd = function(req, res, next) {
    if (req.method =="GET") {
        var postId = req.params.postId,
            secondCatEnglish = req.params.category;

        db.collection('post').findOne({postId: postId}, function(err, result) {
            if (!err && result) {
                var postData = result;
                postData.isAuthor = false;

                if (req.session.user && req.session.user._id+"" == postData.userId+"") {
                    postData.isAuthor = true;
                }

                postData.createTime = dateFormat(postData.createTime, 'mm月dd HH:MM');
                
                db.collection('category').find({
                    '_id': {
                        "$in" : [
                            db.ObjectID.createFromHexString(postData.firstCatId),
                            db.ObjectID.createFromHexString(postData.secondCatId)
                        ]
                    }}).toArray(function(err, result) {
                        if (!err && result) {
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
                                        md: md,
                                        postData: postData,
                                        firstCategory: result[0],
                                        secondCategory: result[1],
                                        relateAds: relateAds || null
                                    }
                                    //用户已经删除的帖子直接采用404
                                    if (postData.status == 'delete') {
                                        res.status(404);
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
                console.log("no this id");
                return next();
            }
        });
    }
};

exports.deleteAd = function(req, res) {
    if(req.method == "GET") {
        var postId = req.params.postId;
        db.collection('post').update({postId: postId}, {$set: {status: 'delete'}}, function(err, result) {
            var renderObj = {}
            if (!err) {
                renderObj.status = 'success';
            } else {
                renderObj.status = 'fail';
            }
            renderObj.postId = postId;

            return res.json(renderObj);
        });
    }
};

exports.purgeAd = function(req, res) {
    if (req.method == 'GET') {
        var postId = req.params.postId;
        db.collection('post').remove({postId: postId}, function(err, result) {
            var renderObj = {}
            if (!err) {
                renderObj.status = 'success';
            } else {
                renderObj.status = 'fail';
            }
            renderObj.postId = postId;

            return res.json(renderObj);
        })
    }
}

exports.editAd = function(req, res) {
    var postId = req.params.postId;
    var user = req.session.user;
    if (req.method == "GET") {
        if (user) {
            db.collection('post').findOne({postId: postId}, function(err, result) {
                var postData = result;
                
                if (postData.userId == user._id+"") {
                    //编辑帖子
                    var secondCatId = postData.secondCatId
                    db.collection('category').findOne({_id: db.ObjectID.createFromHexString(secondCatId)}, function(err, result) {
                        if(!err && result) {
                            result.metas = JSON.parse(result.metas);

                            var renderObj = {
                                title: postData.title,
                                postData: postData,
                                categoryinfo: result
                            }
                            res.render('edit', renderObj);
                        } 
                    });
                } else {
                    return res.redirect('/'+postData.url); 
                }
            });
        } else {
            res.redirect('/login');
        }
    } else {
        if (user) {
            //post 
            var title = req.body.title,
                address = req.body.address,
                contact = req.body.contact,
                detail = req.body.detail,
                postType = req.body.adType;

            if (!title || !address || !contact || !detail || !postType) {
                return res.send('表单某一项丢失');
            }


            var date = new Date();
            var baseObj = {
                updateTime: date.getTime(),
                phone: req.session.user.phone,
                userId: req.session.user._id,
                status: 'ok',
            }

            _.extend(baseObj, req.body);

            db.collection('post').findOne({postId: postId}, function(err, result) {
                if (!err && result && result.userId == user._id+"") {
                    var id = result._id,
                        url = result.url;
                    db.collection('post').update({_id: id}, {$set: baseObj}, function(err, rs) {
                        if (!err, rs) {
                            return res.redirect(url)
                        }
                    })

                } else {
                    return res.send('无权限编辑此帖子');
                }
            });
        } else {
            res.redirect('/login');
        }
    }
};

exports.listAds = function(req, res, next) {
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

            query.status = 'ok';
            db.collection('post').find(query, {sort:[['createTime', -1]]}).limit(200).toArray(function(err, ads) {
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
                        return res.render('category', renderObj);

                    });
                }

            });

        } else {
            //404页面
            next();
        }
    });
};




var configFile = require('../config');
var db = configFile.database;
var dateFormat = require('dateformat');

exports.showAd = function(req, res, next) {
	var renderObj = {title: '帖子管理'};

	if (req.method == 'GET') {
		res.render('adManage', renderObj);
	} else {
		var postId = req.body.postId;
		db.collection('post').findOne({postId: postId}, function(err, result) {
			if (!err && result) {
				result.createTime = dateFormat(result.createTime, 'mm月dd HH:MM');
				renderObj.ad = result;
			} else {
				renderObj.noad = true;
			}
			res.render('adManage', renderObj);
		});
	}
}

/*
 * GET category listing.
 */

var configFile = require('../config');
var db = configFile.database;


exports.showFirstCategory = function(req, res, next) {
	db.collection('category').find({deep: 'first'}).toArray(function(err, result) {
		if (!err && result) {
			res.locals.firstCategoryInfo = result;
		} else {
			res.send('the cateory error');
		}
		next();
	});
};

exports.addFirstCategory = function(req, res) {
	if (req.method == 'GET') {
		res.render('addFirstCategory', {title: '添加一级分类目录'});
	} else {
		var category = req.body.category,
			categoryEnglish = req.body.categoryEnglish;

		if (category && categoryEnglish) {
			db.collection('category').findOne({category: category}, function(err, result) {
				if (result == null) { //不存在的目录
					db.collection('category').insert({
						category: category,
						categoryEnglish: categoryEnglish,
						deep: 'first'
					}, function(err, result) {
						res.render('addFirstCategory', {title: '添加一级分类目录', info: '分类目录添加成功'});
					});
				} else {
					res.render('addFirstCategory', {title: '添加一级分类目录', info: '分类目录已经存在'});
				}
			});
		} else {
			res.render('addFirstCategory', {title: '添加一级分类目录', info:'分类目录或英文名称不能为空'});
		}
	}
};

exports.addCategory = function(req, res) {
	var renderObj = {
		title: "添加二级分类目录"
	};

	var status = {
		success: "分类目录添加成功",
		exists: "分类目录已经存在",
		isnull: "分类目录或英文名称不能为空"
	}

	if (req.method == 'GET') {
		if (req.query.info) {
			renderObj.info = status[req.query.info];
		}

		db.collection('category').find({deep: 'first'}).toArray(function(err, result) {
			if (!err && result) {
				renderObj.items = result;
			} else {
				renderObj.info = "类目加载出错"
			}
			res.render('addCategory', renderObj);
		});
	} else {
		var firstCatId = req.body.firstCatId,
			category = req.body.category,
			categoryEnglish = req.body.categoryEnglish,
			metas = req.body.metas;

		if (category && categoryEnglish) {
			db.collection('category').findOne({category: category}, function(err, result) {
				if (result == null) { //不存在的目录
					db.collection('category').insert({
						firstCatId: firstCatId,
						category: category,
						categoryEnglish: categoryEnglish,
						metas: metas,
						deep: 'second'
					}, function(err, result) {
						res.redirect('/category/addSecond?info=success');
					});
				} else {
					res.redirect('/category/addSecond?info=exists');
				}
			});
		} else {
			res.redirect('/category/addSecond?info=isnull');
		}
	}
};

exports.editCategory = function(req, res) {
	if (req.method == 'GET') {
		res.render('editCategory', {title: 'edit Category'});
	} else {
		
	}
};

exports.delCategory = function(req, res) {
	if (req.method == 'GET') {
		res.render('delCategory', {title: 'delete Category'});
	} else {
		
	}
};
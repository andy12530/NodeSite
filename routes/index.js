
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {title: 'NodeExchange，一个简单的二手交易社区'});
};

exports.notFound = function(req, res) {
	res.status(404).render(404, {title: "没找到！"});
}

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.notFound = function(req, res) {
	res.status(404).send('not found the page');
}
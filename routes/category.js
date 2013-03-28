
/*
 * GET category listing.
 */
exports.addCategory = function(req, res) {
	if (req.method == 'GET') {
		res.render('addCategory', {title: 'add Category'});
	} else {

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

exports.listAds = function(req, res){
    res.send("respond with all ads on  this category");
};
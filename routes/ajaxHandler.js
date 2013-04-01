

var configFile = require('../config');
var db = configFile.database;

// show the second category
exports.secondCat = function(req, res) {
    var firstCatId = req.query.firstCatId;
    db.collection('category').find({firstCatId: firstCatId}).toArray(function(err, result) {
        if (err || !result) {
            result = null;
        }
        return res.json(result);
    });
};
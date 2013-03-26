
/*
 * GET home page.
 */

exports.index = function(req, res) {
    res.render('index.jade', { title: 'Express 3.0'}); 
}

exports.notFound = function(req, res) {
    //res.writeHead(200);
    res.status(404).send('the page not found');
}
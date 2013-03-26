
/*
 * the routes
 */

var main = require('./index.js'),
    user = require('./user.js'),
    category = require('./category.js'),
    ads = require('./ads');

module.exports = function(app) {
    app.get('/', user.auth, main.index);


    /* user manager */
    app.get('/login', user.login);
    app.post('/login', user.login);

    app.get('/register', user.register);
    app.post('/register', user.register);

    app.get('/forgot', user.forgot);
    app.post('/forgot', user.forgot);

    app.get('/user/profile', user.profile);
    app.post('/user/profile', user.profile);

    app.get('/user/ads', user.listAds);

    /* category manager */
    app.get('/:category', category.listAds);


    /*create ads */
    app.get('/create', ads.create);
    app.post('/:create', ads.create);

    /* ads manager */
    app.get('/:category/:adId([0-9]+)', ads.showAd);
    app.get('/:category/:adId([0-9]+)/delete', ads.deleteAd);

    app.get('/:category/:adId([0-9]+)/edit', ads.editAd);
    app.post('/:category/:adId([0-9]+)/edit', ads.editAd);

    /* other page show 404 */
    app.get('*', main.notFound);

}
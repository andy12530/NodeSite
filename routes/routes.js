
/*
 * the routes
 */

var index = require('./index'),
    user = require('./user'),
    category = require('./category'),
    ads = require('./ads');

module.exports = function(app) {
    app.get('/', user.auth, index.index);

    /* user manager */
    app.get('/login', user.login);
    app.post('/login', user.login);

    app.get('/logout', user.logout);

    app.get('/register', user.register);
    app.post('/register', user.register);

    app.get('/forgot', user.forgot);
    app.post('/forgot', user.forgot);

    app.get('/user/profile', user.profile);
    app.post('/user/profile', user.profile);

    app.get('/user/:userId([0-9]+)', user.showUser);


    /* category manager */
    app.get('/category/add', category.addCategory);
    app.get('/category/edit', category.editCategory);
    app.get('/category/delete', category.delCategory);


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
    app.get('*', index.notFound);

}
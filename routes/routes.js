
/*
 * the routes
 */

var index = require('./index'),
    user = require('./user'),
    category = require('./category'),
    ads = require('./ads'),
    ajaxHandler = require('./ajaxHandler');

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

    /*create ads */
    app.get('/create', user.auth, ads.create);
    app.post('/create', ads.create);

    
    /* category manager */
    app.get('/category/addFirst', category.addFirstCategory);
    app.post('/category/addFirst', category.addFirstCategory);

    // category更多的是在修改二级类目
    app.get('/category/addSecond', category.addCategory);
    app.post('/category/addSecond', category.addCategory);

    app.get('/category/edit', category.editCategory);
    app.get('/category/delete', category.delCategory);   

    /* ajax  handler*/
    app.get('/ajax/secondCat', ajaxHandler.secondCat);

    app.get('/:category', ads.listAds);

    /* ads manager */
    app.get('/:category/:postId([0-9]+)', user.auth, ads.showAd);
    app.get('/:category/:postId([0-9]+)/delete', ads.deleteAd);

    app.get('/:category/:postId([0-9]+)/edit', ads.editAd);
    app.post('/:category/:postId([0-9]+)/edit', ads.editAd);

    /* other page show 404 */
    app.get('*', index.notFound);

}
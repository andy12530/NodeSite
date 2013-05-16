/*
config
*/
var mongoskin = require('mongoskin');
var memcache = require('memcache');

exports.config = {
	session_secret: "SESSION_andy12530",
	auth_cookie_name: 'node_cookie',
	system_email: 'admin@amzbook.com',
	Mailer: {
		service: "QQ",
		from: "admin@amzbook.com",
		auth: {
			user: "admin@amzbook.com",
			pass: "abc"
		}
	}
};

exports.database = mongoskin.db("localhost/nodejs", {safe: true});

exports.memcache = new memcache.Client('11211', 'localhost');

 
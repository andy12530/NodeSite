/*
config
*/
var mongoskin = require('mongoskin');

exports.config = {
	cookie_secret: "andy12530hfutsoftware",
	auth_cookie_name: 'nodesite_secret',
	time_zone: 8,
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
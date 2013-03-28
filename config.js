/*
config
*/
var mongoskin = require('mongoskin');

exports.config = {
	session_secret: "SESSION_andy12530",
	cookie_secret: "COOKIE_andy12530",
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
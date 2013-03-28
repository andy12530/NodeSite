/*
config
*/
var mongoskin = require('mongoskin');

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

exports.database = mongoskin.db("localhost/testdb", {safe: true});
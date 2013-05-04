var http = require('http');

var server = module.exports = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

if (!module.parent) {
  server.listen(3000, function() {
    console.log("Express server listening on port 3000");
  });
};
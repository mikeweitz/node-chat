var http = require('http');

console.log('module loading...');

var makeRequest = function(message){
	var opts = {
		host: 'localhost',
		port: 8080,
		path: '/',
		method: 'POST'
	};

	var request = http.request(opts, function(response){
		response.on('data', function(data){
			console.log(data);
		})
	});

	request.write(message);
	request.end();
}

module.exports = makeRequest;
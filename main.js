var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
// var fs = require('fs');

app.use("/assets", express.static(__dirname + '/assets'));

var users = [];
var messages = []

// save the messages to an array 
var storeMessages = function(name, data){
	messages.push({name: name, data: data});
	if (messages.length > 10){
		messages.shift();
	}
}

var storeUsers = function(name){
	if (users.indexOf(name) !== -1) {
		return false;
	} else {
		users.push(name)
	}
}

var deleteUser = function(name){
	try {
		var i = users.indexOf(name);
		users.splice(i,1);
		console.log('search for user ' + name + ' at index ' + i);
	} catch(err) {
		return err
	}
}


var logTime = function(){
		var d = new Date(),
			h = (d.getHours() > 12) ? d.getHours() -12 : d.getHours(),
			m = d.getMinutes(),
			s = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds(),
			mer = (d.getHours() < 12) ? 'am' : 'pm';

		return h + ':' + m + ':' + s + ' ' + mer;
}



// var initUesrlist = function(){
// 	// send the chat log to the new user
// 	users.forEach(function(usr){
// 		console.log(msg);
// 		client.emit("join", { user: usr });
// 		client.broadcast.emit("join", { user: usr });
// 	});
// }


io.on('connection', function(client){
	console.log('Client connected...');

	// Join Event - new user joined
	client.on('join', function(name){
		console.log(name + " has joined the chat!");
		client.nickname = name;

		storeUsers(name);

		// send the chat log to the new user
		messages.forEach(function(msg){
			client.emit("messages", { message: msg.data, user: msg.name });
		});

		console.log('broadcast userlist', users);

		// send the user list to the new user
		client.emit("join", users);
		client.broadcast.emit("join", users);

		// Update the actiity log
		client.emit("activity", logTime() + ' - ' + "You joined the chat.");
		client.broadcast.emit("activity", logTime() + ' - ' + name + " joined the chat.");

	});

	// Message event (user sent a chat message)
	client.on('messages', function(data){ 
		console.log(data); 
		var nickname = client.nickname;
		client.emit("messages", { message: data, user: nickname });
		client.broadcast.emit("messages", { message: data, user: nickname });

		storeMessages(nickname, data);

	});


	client.on('disconnect', function() {
		var name = client.nickname;
		console.log(name + ' disconnected');
		deleteUser(name);
		console.log('remaining users: ', users);
		// send the chat log to the new user

		// Update user event
		client.emit("join", users);
		client.broadcast.emit("join", users);

		// Log activity
		client.emit("activity", logTime() + ' - ' + name + " left the chat.");
		client.broadcast.emit("activity", logTime() + ' - ' + name + " left the chat.");

	});

});

// Root route
app.get('/', function(request, response){
	response.sendFile(__dirname + '/index.html');
});

server.listen(8080);
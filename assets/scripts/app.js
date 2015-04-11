'use strict';


var $chatlog = $('#chatlog ul'),
	$activityLog = $('#activityLog ul'),
	$userList = $('#userlist ul');


// Declare our Angular app:
var chatApp = angular.module('chatApp',[]);

// Run time init - connect to socket
chatApp.run(function(socket){
	console.log('run block');

	socket.on('connect', function(data){
		$('#status').html('Connected to Chat Room');
		var nickname = prompt("Enter your name for the chatroom:");
		if (nickname) {
			socket.emit('join', nickname);
		} 
		else {
			alert('DAMMIT!');
		}

	});

});

// Message input controller
chatApp.controller('userList', ['$scope', 'socket', function($scope, socket) {
	$scope.users = [];

	socket.on('join', function(data){
		$scope.users = data
	});

}]);

// Chat log controller
chatApp.controller('chatLog', ['$scope', 'socket', function($scope, socket) {
	$scope.messages = [];

	socket.on('messages', function(data){
		$scope.messages.push(data);
	});

}]);


// Activity input controller
chatApp.controller('activityLog', ['$scope', 'socket', function($scope, socket) {
	$scope.logs = [];

	socket.on('activity', function(data){
		$scope.logs.push(data);
	});

}]);


// Attach controller for chat input:
chatApp.controller('chatInput', ['$scope', function($scope) {

	$scope.setFilters = function (event) {
		event.preventDefault();
		console.log('Clicked!', event);
	};

	$scope.send = function(){
		console.log('Click was triggered')
		var msg = $('#chat-message').val();
		socket.emit('messages', msg);
		$('#chat-message').val('');
	}

}]);


// Create a service for socket.io events
chatApp.factory('socket', ['$rootScope', function ($rootScope) {
  // var socket = io.connect();
  var socket = io.connect('http://localhost:8080');

  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);

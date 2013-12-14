var localStorage = window.localStorage;

var username = localStorage.getItem("username");
var password = localStorage.getItem("password");

exports.username = function() {
	return username;
}

exports.password = function() {
	return password;
}

exports.setUsername = function(text) {
	username = text;
	localStorage.setItem("username", username);
}

exports.setPassword = function(text) {
	password = text;
	localStorage.setItem("password", password);
}

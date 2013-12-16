var localStorage = window.localStorage;

var username = localStorage.getItem("username");
var password = localStorage.getItem("password");
var projectsDirectory = localStorage.getItem("projectsDirectory");

exports.username = function() {
	return username;
}

exports.password = function() {
	return password;
}

exports.projectsDirectory = function() {
	return projectsDirectory;
}

exports.setUsername = function(text) {
	username = text;
	localStorage.setItem("username", username);
}

exports.setPassword = function(text) {
	password = text;
	localStorage.setItem("password", password);
}

exports.setProjectsDirectory = function(dir) {
	projectsDirectory = dir;
	localStorage.setItem("projectsDirectory", projectsDirectory);
}

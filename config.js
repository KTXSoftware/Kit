var localStorage = window.localStorage;

var username = localStorage.getItem("username");
var password = localStorage.getItem("password");
var projectsDirectory = localStorage.getItem("projectsDirectory");
var mp3encoder = localStorage.getItem("mp3encoder");
var aacencoder = localStorage.getItem("aacencoder");

exports.username = function() {
	return username;
}

exports.password = function() {
	return password;
}

exports.projectsDirectory = function() {
	return projectsDirectory;
}

exports.mp3Encoder = function() {
	return mp3encoder;
}

exports.aacEncoder = function() {
	return aacencoder;
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

exports.setMP3Encoder = function(text) {
	mp3encoder = text;
	localStorage.setItem("mp3encoder", mp3encoder);
}

exports.setAACEncoder = function(text) {
	aacencoder = text;
	localStorage.setItem("aacencoder", aacencoder);
}

var fs      = require('fs');
var path    = require('path');

var options = {
	version: 1,
	projectsDirectory: '',
	mp3encoder: '',
	aacencoder: '',
	servers: [
		{
			type: 'github',
			path: 'orgs/ktxsoftware'
		}
	]
};

var filename;

function load() {
	try {
		options = JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'}));
	}
	catch (e) {
		var localStorage = window.localStorage;
		options.projectsDirectory = localStorage.getItem('projectsDirectory');
		options.mp3encoder = localStorage.getItem('mp3encoder');
		options.aacencoder = localStorage.getItem('aacencoder');
	}	
}

function save() {
	fs.writeFile(filename, JSON.stringify(options, null, '\t'), {encoding: 'utf8'}, function (err) {

	});
}

load();

exports.init = function (dataPath) {
	filename = dataPath + path.sep + 'options.json';
}

exports.projectsDirectory = function() {
	return options.projectsDirectory;
}

exports.mp3Encoder = function() {
	return options.mp3encoder;
}

exports.aacEncoder = function() {
	return options.aacencoder;
}

exports.servers = function () {
	return options.servers;
}

exports.setProjectsDirectory = function(dir) {
	options.projectsDirectory = dir;
	save();
}

exports.setMP3Encoder = function(text) {
	options.mp3encoder = text;
	save();
}

exports.setAACEncoder = function(text) {
	options.aacencoder = text;
	save();
}

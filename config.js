var fs      = require('fs');
var path    = require('path');

var options = {
	version: 1,
	projectsDirectory: '',
	mp3encoder: '',
	aacencoder: '',
	hideUnavailable: false,
	git: 'git',
	servers: [
		{
			name: 'ktx-github',
			type: 'github',
			path: 'orgs/ktxsoftware'
		}
		/*
		{
			"name": "ktx-gitblit"
			"type": "gitblit",
			"url": "git.ktxsoftware.com",
			"user": "",
			"pass": ""
		}
		*/
	]
};

var serverData = { };

var optionsPath;
var optionsFile;

function load() {
	try {
		options = JSON.parse(fs.readFileSync(optionsFile, {encoding: 'utf8'}));
		if (options.hideUnavailable === undefined) options.hideUnavailable = false;
		if (options.git === undefined) options.git = 'git';
		for (var s in options.servers) {
			var server = options.servers[s];
			if (server.name === undefined) server.name = 'ktx-github';
		}
	}
	catch (e) {
		var localStorage = window.localStorage;
		options.projectsDirectory = localStorage.getItem('projectsDirectory');
		options.mp3encoder = localStorage.getItem('mp3encoder');
		options.aacencoder = localStorage.getItem('aacencoder');
	}
	for (var s in options.servers) {
		var server = options.servers[s];
		try {
			serverData[server.name] = JSON.parse(fs.readFileSync(optionsPath + server.name + '.json', {encoding: 'utf8'}));
		}
		catch (e) {
			serverData[server.name] = { etag: null, repositories: [] };
		}
	}
}

function save() {
	fs.writeFile(optionsFile, JSON.stringify(options, null, '\t'), {encoding: 'utf8'}, function (err) {
		// TODO: log error?
	});
}

exports.init = function (dataPath) {
	optionsPath = dataPath + path.sep;
	optionsFile = optionsPath + 'options.json';
	load();
}

exports.projectsDirectory = function () {
	return options.projectsDirectory;
}

exports.mp3Encoder = function () {
	return options.mp3encoder;
}

exports.aacEncoder = function () {
	return options.aacencoder;
}

exports.servers = function () {
	return options.servers;
}

exports.serverData = function (serverName) {
	return serverData[serverName];
}

exports.hideUnavailable = function () {
	return options.hideUnavailable;
}

exports.git = function () {
	return options.git;
}

exports.setProjectsDirectory = function (dir) {
	options.projectsDirectory = dir;
	save();
}

exports.setMP3Encoder = function (text) {
	options.mp3encoder = text;
	save();
}

exports.setAACEncoder = function (text) {
	options.aacencoder = text;
	save();
}

exports.setHideUnavailable = function (hide) {
	options.hideUnavailable = hide;
	save();
}

exports.setGit = function (git) {
	options.git = git;
	save();
}

exports.saveServerData = function (serverName) {
	fs.writeFile(optionsPath + serverName + '.json', JSON.stringify(serverData[serverName], null, '\t'), {encoding: 'utf8'}, function (err) {
		// TODO: log error?
	});
}
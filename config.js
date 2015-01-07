define(function () {
	var fs      = require('fs');
	var path    = require('path');

	var options = {
		version: 1,
		projectsDirectory: '',
		mp3encoder: '',
		aacencoder: '',
		hideUnavailable: false,
		git: 'git',
		visualStudio: 'vs2013',
		windowsGraphics: 'direct3d9',
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
				"url": "gitserver.com",
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
		}
		catch (e) {
			
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

	var exports = {};

	exports.init = function (dataPath) {
		optionsPath = dataPath + path.sep;
		optionsFile = optionsPath + 'options.json';
		load();
	};

	exports.projectsDirectory = function () {
		return options.projectsDirectory;
	};

	exports.mp3Encoder = function () {
		return options.mp3encoder;
	};

	exports.aacEncoder = function () {
		return options.aacencoder;
	};

	exports.servers = function () {
		return options.servers;
	};

	exports.serverData = function (serverName) {
		return serverData[serverName];
	};

	exports.hideUnavailable = function () {
		return options.hideUnavailable;
	};

	exports.git = function () {
		return options.git;
	};

	exports.visualStudio = function () {
		return options.visualStudio;
	};

	exports.windowsGraphics = function () {
		return options.windowsGraphics;
	};

	exports.setProjectsDirectory = function (dir) {
		options.projectsDirectory = dir;
		save();
	};

	exports.setMP3Encoder = function (text) {
		options.mp3encoder = text;
		save();
	};

	exports.setAACEncoder = function (text) {
		options.aacencoder = text;
		save();
	};

	exports.setHideUnavailable = function (hide) {
		options.hideUnavailable = hide;
		save();
	};

	exports.setGit = function (git) {
		options.git = git;
		save();
	};

	exports.setVisualStudio = function (visualStudio) {
		options.visualStudio = visualStudio;
		save();
	};

	exports.setWindowsGraphics = function (windowsGraphics) {
		options.windowsGraphics = windowsGraphics;
		save();
	};

	exports.saveServerData = function (serverName) {
		fs.writeFile(optionsPath + serverName + '.json', JSON.stringify(serverData[serverName], null, '\t'), {encoding: 'utf8'}, function (err) {
			// TODO: log error?
		});
	};

	return exports;
});

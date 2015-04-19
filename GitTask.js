"use strict";

define(['./log.js'], function (log) {
	var spawn = require('child_process').spawn;
	var path = require('path');

	function kittMessage(data) {
		document.getElementById('kittinfo').innerHTML = data;
	}

	function spawnGit(parameters, callback) {
		parameters[0] = path.normalize(parameters[0]);
		parameters[1] = path.normalize(parameters[1]);

		var params = '';
		for (var p in parameters) params += ' ' + parameters[p];

		log.info('Calling kitgit' + params);

		var remote = require('remote');
		var app = remote.require('app');
		var exe = app.getPath('exe');
		var dir = exe.substr(0, exe.lastIndexOf(path.sep));

		var process = spawn(path.join(dir, 'kitgit'), parameters);
		process.stdin.setEncoding('utf8');

		let lastLine = '';

		process.stdout.on('data', function (data) {
			let str = data.toString('utf8');
			var lines = str.split('\n');
			var firstLine = lastLine + lines[0];
			lines[0] = firstLine;
			lastLine = lines.pop();
			for (let line of lines) {
				if (line.startsWith('#')) kittMessage(line.substr(1));
				else log.info(line);
			}
		});

		process.stderr.on('data', function (data) {
			log.error(data.toString('utf8'));
		});

		process.on('error', function (err) {
			log.error('Could not call kitgit with parameters' + params);
			callback(1);
		});

		process.on('close', function (code) {
			if (code !== 0) {
				log.error('Kitgit reported error with parameters' + params);
				callback(code);
			}
			else {
				callback(code);
			}
		});
	}

	var exports = {};

	exports.execute = function (parameters, callback) {
		var remote = require('remote');
		var app = remote.require('app');
		spawnGit([app.getPath('userData') + '/', parameters.projectsDir, parameters.repo.name], function (code) {
			callback();
		});
	};

	return exports;
});

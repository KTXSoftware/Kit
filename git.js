"use strict";

var fs = require('fs');
var spawn = require('child_process').spawn;
var log = require('./log.js');
var kitt = null;

function kittMessage(data) {
	var lastReturn = 0;
	var lastGoodReturn = 0;
	for (var i = 0; i < data.length; ++i) {
		if (data[i] == 0xa || data[i] == 0xd) {
			lastReturn = i;
		}
		if (data[i] > 0x20) {
			lastGoodReturn = lastReturn;
		}
	}
	data = data.slice(lastGoodReturn);
	kitt.innerHTML = data;
}

function clone(project, baseurl, projectsDir, callback) {
	var process = spawn('git', ['clone', '--depth', '50', '--progress', baseurl + project, projectsDir + project]);

	process.stdout.on('data', function (data) {
		log.info(data);
	});

	process.stderr.on('data', function (data) {
		kittMessage(data);
	});

	process.on('close', function (code) {
		var process = spawn('git', ['submodule', 'update', '--depth', '50', '--init', '--recursive'], {cwd: projectsDir + project});

		process.stdout.on('data', function (data) {
			log.info(data);
		});

		process.stderr.on('data', function (data) {
			kittMessage(data);
		});

		process.on('close', function (code) {
			kitt.innerHTML = '';
			callback();
		});
	});
}

function pull(project, baseurl, projectsDir, callback) {
	var process = spawn('git', ['pull', '--progress'], {cwd: projectsDir + project});

	process.stdout.on('data', function (data) {
		log.info(data);
	});

	process.stderr.on('data', function (data) {
		kittMessage(data);
	});

	process.on('close', function (code) {
		kitt.innerHTML = '';
		callback();
	});
}

exports.init = function(kitty) {
	kitt = kitty;
}

exports.update = function(project, baseurl, projectsDir, callback) {
	fs.stat(projectsDir + project, function(err, stats) {
		if (!err && stats.isDirectory()) {
			pull(project, baseurl, projectsDir, callback);
		}
		else {
			clone(project, baseurl, projectsDir, callback);
		}
	});	
};

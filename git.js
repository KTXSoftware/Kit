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

function spawnGit(parameters, dir, callback) {
	var process = spawn('git', parameters, {cwd: dir});
	var std = '';
	
	process.stdout.on('data', function (data) {
		std += data;
		log.info(data);
	});

	process.stderr.on('data', function (data) {
		kittMessage(data);
	});

	process.on('close', function (code) {
		callback(code, std);
	});
}

function findSubmodules(dir, callback) {
	spawnGit(['submodule', 'status'], dir, function (code, std) {
		var submodules = [];
		var lines = std.split(/\r?\n/);
		for (var line in lines) {
			if (lines[line] === '') continue;
			var submodule = lines[line].substr(42);
			if (submodule.contains(' ')) {
				submodule = submodule.substr(0, submodule.lastIndexOf(' '));
			}
			submodules.push(submodule);
		}
		callback(submodules);
	});
}

function clone(project, baseurl, dir, callback) {
	spawnGit(['clone', '--depth', '50', '--progress', baseurl + project, dir + project], dir, function (code, std) {
		spawnGit(['submodule', 'init'], dir + project, function (code, std) {
			findSubmodules(dir + project, function (submodules) {
				var subcount = submodules.length;
				for (var s in submodules) {
					var submodule = submodules[s];
					clone(submodule, baseurl, dir + project + '/', function() {
						--subcount;
						if (subcount == 0) {
							kitt.innerHTML = '';
							callback();
						}
					});
				}
			});
		});
	});

	/*var process = spawn('git', ['submodule', 'update', '--depth', '50', '--init', '--recursive'], {cwd: dir + project});

	process.stdout.on('data', function (data) {
		log.info(data);
	});

	process.stderr.on('data', function (data) {
		kittMessage(data);
	});

	process.on('close', function (code) {
		kitt.innerHTML = '';
		callback();
	});*/
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

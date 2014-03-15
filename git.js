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
	fs.readFile(dir + '/.gitmodules', {encoding: 'utf-8'}, function (err, data) {
		if (err) {
			callback([]);
			return;
		}
		var submodules = [];
		var submodule = null;
		var lines = data.split(/\r?\n/);
		for (var l in lines) {
			var line = lines[l].trim();
			if (line === '') continue;
			if (line.startsWith('[')) {
				if (submodule !== null) submodules.push(submodule);
				submodule = {};
			}
			else {
				var parts = line.split(/=/);
				var first = parts[0].trim();
				var second = parts[1].trim();
				submodule[first] = second;
			}
		}
		if (submodule !== null) submodules.push(submodule);
		callback(submodules);
	});
}

function clone(project, baseurl, dir, subdir, callback) {
	spawnGit(['clone', '--depth', '50', '--progress', baseurl + project, dir + subdir], dir, function (code, std) {
		spawnGit(['submodule', 'init'], dir + subdir, function (code, std) {
			findSubmodules(dir + subdir, function (submodules) {
				if (submodules.length === 0) {
					callback();
					return;
				}
				var subcount = submodules.length;
				for (var s in submodules) {
					var submodule = submodules[s];
					clone(submodule.url.substr(3), baseurl, dir + subdir + '/', submodule.path, function() {
						--subcount;
						if (subcount == 0) {
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
			clone(project, baseurl, projectsDir, project, function() {
				kitt.innerHTML = '';
				callback();
			});
		}
	});	
};

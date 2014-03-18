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

function clone(project, branch, baseurl, dir, subdir, projectsDir, specials, callback) {
	spawnGit(['clone', '-b', branch, '--progress', baseurl + project, dir + subdir], dir, function (code, std) {
		spawnGit(['submodule', 'init'], dir + subdir, function (code, std) {
			findSubmodules(dir + subdir, function (submodules) {
				if (submodules.length === 0) {
					callback();
					return;
				}
				var subcount = submodules.length;
				if (!baseurl.startsWith('http')) {
					baseurl += subdir + '/';
				}
				for (var s in submodules) {
					let submodule = submodules[s];
					let url = submodule.url.substr(3);
					if (specials && (url === 'Kha' || url === 'Kore')) {
						exports.update(url, baseurl, projectsDir, function () {
							clone(url, submodule.branch, projectsDir, dir + subdir + '/', submodule.path, projectsDir, false, function () {
								--subcount;
								if (subcount == 0) {
									callback();
								}
							});
						});
					}
					else {
						clone(baseurl.startsWith('http') ? url : submodule.path, submodule.branch, baseurl, dir + subdir + '/', submodule.path, projectsDir, specials, function () {
							--subcount;
							if (subcount == 0) {
								callback();
							}
						});
					}
				}
			});
		});
	});
}

function pull(project, baseurl, projectsDir, dir, specials, callback) {
	spawnGit(['pull', '--progress'], dir, function () {
		findSubmodules(dir, function (submodules) {
			if (submodules.length === 0) {
				callback();
				return;
			}
			var subcount = submodules.length;
			for (var s in submodules) {
				let submodule = submodules[s];
				let url = submodule.url.substr(3);
				if (specials && (url === 'Kha' || url === 'Kore')) {
					pull(url, baseurl, projectsDir, projectsDir + url, false, function () {
						pull(url, baseurl, projectsDir, dir + '/' + submodule.path, false, function () {
							--subcount;
							if (subcount == 0) {
								callback();
							}
						});
					});
				}
				else {
					pull(url, baseurl, projectsDir, dir + '/' + submodule.path, specials, function () {
						--subcount;
						if (subcount == 0) {
							callback();
						}
					});
				}
			}
		});
	});
}

exports.init = function(kitty) {
	kitt = kitty;
}

exports.update = function(project, baseurl, projectsDir, callback) {
	fs.stat(projectsDir + project, function(err, stats) {
		if (!err && stats.isDirectory()) {
			pull(project, baseurl, projectsDir, projectsDir + project, project !== 'Kha' && project !== 'Kore', function () {
				kitt.innerHTML = '';
				callback();
			});
		}
		else {
			clone(project, "master", baseurl, projectsDir, project, projectsDir, project !== 'Kha' && project !== 'Kore', function() {
				kitt.innerHTML = '';
				callback();
			});
		}
	});	
};

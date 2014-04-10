"use strict";

var fs = require('fs');
var path = require('path');
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

function isSpecial(name) {
	return name === 'Kha' || name === 'Kore';
}

function clone(repo, repos, branch, baseurl, dir, subdir, projectsDir, specials, callback) {
	spawnGit(['clone', '-b', branch, '--progress', baseurl === null ? repos[repo.name].baseurl + repo.name : path.relative(dir, baseurl + repo.path), dir + subdir], dir, function (code, std) {
		spawnGit(['submodule', 'init'], dir + subdir, function (code, std) {
			findSubmodules(dir + subdir, function (submodules) {
				if (submodules.length === 0) {
					callback();
					return;
				}
				let subcount = submodules.length;
				if (baseurl !== null) {
					baseurl += subdir + '/';
				}
				for (let s in submodules) {
					let submodule = submodules[s];
					let url = submodule.url.substr(3);
					if (specials && isSpecial(url)) {
						exports.update(repos[url], repos, projectsDir, function () {
							clone({path: url}, repos, submodule.branch, projectsDir, dir + subdir + '/', submodule.path, projectsDir, false, function () {
								--subcount;
								if (subcount == 0) {
									callback();
								}
							});
						});
					}
					else {
						clone(baseurl === null ? repos[url] : {path: submodule.path}, repos, submodule.branch, baseurl, dir + subdir + '/', submodule.path, projectsDir, specials, function () {
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

function pull(projectsDir, dir, specials, callback) {
	spawnGit(['pull', '--progress'], dir, function () {
		findSubmodules(dir, function (submodules) {
			if (submodules.length === 0) {
				callback();
				return;
			}
			let subcount = submodules.length;
			for (let s in submodules) {
				let submodule = submodules[s];
				let url = submodule.url.substr(3);
				if (specials && isSpecial(url)) {
					pull(projectsDir, projectsDir + url, false, function () {
						pull(projectsDir, dir + '/' + submodule.path, false, function () {
							--subcount;
							if (subcount == 0) {
								callback();
							}
						});
					});
				}
				else {
					pull(projectsDir, dir + '/' + submodule.path, specials, function () {
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

exports.update = function(repo, repos, projectsDir, callback) {
	fs.stat(projectsDir + repo.name, function(err, stats) {
		if (!err && stats.isDirectory()) {
			pull(projectsDir, projectsDir + repo.name, !isSpecial(repo.name), function () {
				kitt.innerHTML = '';
				callback();
			});
		}
		else {
			clone(repo, repos, "master", null, projectsDir, repo.name, projectsDir, !isSpecial(repo.name), function() {
				kitt.innerHTML = '';
				callback();
			});
		}
	});	
};

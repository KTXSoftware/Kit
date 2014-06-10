"use strict";

var config = require('./config.js');
var fs = require('fs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;
var log = require('./log.js');
var kitt = null;
var dataPath = null;
var myProcess = null;

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

function spawnGit(parameters, dir, callback, retrynum) {
	if (retrynum === undefined) retrynum = 0;

	var params = '';
	for (var p in parameters) params += ' ' + parameters[p];

	log.info('Calling git' + params + ' in ' + dir);
	
	var env = myProcess.env;
	if (os.platform() === 'darwin') env.GIT_ASKPASS = myProcess.cwd() + '/Kit/kitpass/kitpass-osx';
	else env.GIT_ASKPASS = myProcess.cwd() + '/Kit/kitpass/kitpass.exe';
	env.KIT_DATA_PATH = dataPath;
	var process = spawn(config.git(), parameters, {cwd: dir, env: env});
	process.stdin.setEncoding('utf8');
	var std = '';
	
	process.stdout.on('data', function (data) {
		std += data;
		log.info(data);
	});

	process.stderr.on('data', function (data) {
		kittMessage(data);
	});

	process.on('error', function (err) {
		log.error('Could not call git with parameters' + params + ' in ' + dir);
		callback(1, std);
	});

	process.on('close', function (code) {
		if (code !== 0) {
			if (retrynum > 2) {
				log.error('Git reported error with parameters' + params + ' in ' + dir);
				callback(code, std);
			}
			else {
				spawnGit(parameters, dir, callback, retrynum + 1);
			}
		}
		else {
			callback(code, std);
		}
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

function addAllRemotes(remotes, dir, callback) {
	var remote = remotes.pop();
	spawnGit(['remote', 'add', remote.name, remote.url], dir, function (code, std) {
		if (remotes.length === 0) callback();
		else addAllRemotes(remotes, dir, callback);
	});
}

function addRemotes(repo, dir, callback) {
	if (repo.server !== undefined) {
		var remotes = [];
		remotes.push({name: repo.server.name, url: repo.baseurl + repo.name});
		for (var o in repo.others) {
			var other = repo.others[o];
			remotes.push({name: other.server.name, url: other.baseurl + other.name});
		}
		addAllRemotes(remotes, dir, callback);
	}
	else callback();
}

function clone(repo, repos, branch, baseurl, dir, subdir, projectsDir, specials, callback) {
	spawnGit(['clone', '-b', branch, '--progress', baseurl === null ? repo.baseurl + repo.name : path.relative(dir, baseurl + repo.path), dir + subdir], dir, function (code, std) {
		addRemotes(repo, dir + subdir, function() {
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
						if (repo.name !== undefined && repo.name.lastIndexOf('/') !== -1) {
							url = repo.name.substr(0, repo.name.lastIndexOf('/')) + '/' + url;
						}
						if (specials && isSpecial(url)) {
							exports.update(repos[url], repos, projectsDir, function () {
								let project = Object.create(repos[url]);
								project.path = url;
								clone(project, repos, submodule.branch, projectsDir, dir + subdir + '/', submodule.path, projectsDir, false, function () {
									--subcount;
									if (subcount == 0) {
										callback();
									}
								});
							});
						}
						else {
							let project = null;
							if (baseurl === null) project = repos[url];
							else {
								project = Object.create(repos[url]);
								project.path = submodule.path;
							}
							clone(project, repos, submodule.branch, baseurl, dir + subdir + '/', submodule.path, projectsDir, specials, function () {
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

exports.init = function(aKitt, aProcess, aDataPath) {
	kitt = aKitt;
	myProcess = aProcess;
	dataPath = aDataPath;
}

exports.update = function(repo, repos, projectsDir, callback) {
	fs.stat(projectsDir + repo.name, function(err, stats) {
		if (!err && stats.isDirectory()) {
			pull(projectsDir, projectsDir + repo.name, !isSpecial(repo.name) && repo.name.indexOf('/') === -1, function () {
				kitt.innerHTML = '';
				callback();
			});
		}
		else {
			clone(repo, repos, "master", null, projectsDir, repo.name, projectsDir, !isSpecial(repo.name) && repo.name.indexOf('/') === -1, function() {
				kitt.innerHTML = '';
				callback();
			});
		}
	});	
};

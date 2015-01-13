"use strict";

define(['./config.js', './log.js'], function (config, log) {
	var fs = require('fs');
	var https = require("https");

	var changeCallbacks = [];

	function isProject(name) {
		return fs.existsSync(config.projectsDirectory() + "/" + name + "/Kore")
			|| fs.existsSync(config.projectsDirectory() + "/" + name + "/Kt")
			|| fs.existsSync(config.projectsDirectory() + "/" + name + "/Kha");
	}

	var projects = {};

	function findProjectDirs(projects) {
		var dirs = [];
		try {
			dirs = fs.readdirSync(config.projectsDirectory());
		}
		catch (e) {
			log.info('Could not read projects directory "' + config.projectsDirectory() + '" because ' + e);
		}
		for (var p in projects) {
			var project = projects[p];
			if (project === null || project.name.endsWith("/") || project.name.startsWith("Archive/")) {
				delete projects[p];
			}
		}
		for (var dir in dirs) {
			if (projects[dirs[dir]] !== undefined) {
				projects[dirs[dir]].available = true;
			}
			else if (isProject(dirs[dir])) {
				projects[dirs[dir]] = {name: dirs[dir], project: dirs[dir], available: true};
			}
			else {
				var dirs2 = [];
				try {
					dirs2 = fs.readdirSync(config.projectsDirectory() + '/' + dirs[dir]);
					for (var d in dirs2) {
						var dir2 = dirs2[d];
						var name = dirs[dir] + '/' + dir2;
						if (projects[name] !== undefined) {
							projects[name].available = true;
						}
						else if (isProject(name)) {
							projects[name] = {name: name, project: name, available: true};
						}
					}
				}
				catch (e) {

				}
			}
		}
	}

	var repoarray = [];

	function addProjects(callback) {
		repoarray = [];
		for (var p in projects) {
			repoarray.push(projects[p]);
		}
		repoarray.sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });

		for (var c in changeCallbacks) {
			changeCallbacks[c](repoarray);
		}
		callback();
	}

	var serverCount;

	function finishServer(callback) {
		--serverCount;
		if (serverCount === 0) {
			log.info("Downloaded list of projects.");
			findProjectDirs(projects);
			addProjects(callback);
		}
	}

	function pushServer(array, project) {
		for (var v in array) {
			var value = array[v];
			if (value.server.name === project.server.name) return;
		}
		array.push(project);
	}

	function addProject(project, serverPrio, projects) {
		var name = project.name;
		if (projects[name] === undefined) {
			projects[name] = project;
		}
		else if (projects[name].prio < serverPrio) {
			for (var o in projects[name].others) {
				pushServer(project.others, projects[name].others[o]);
			}
			projects[name].others = [];
			pushServer(project.others, projects[name]);
			projects[name] = project;
		}
		else {
			pushServer(projects[name].others, project);
		}
	}

	function getServerInfo(res, server, serverPrio, serverData, page, callback) {
		if (res.headers.link !== undefined) {
			//<https://api.github.com/resource?page=2>; rel="next",
			let links = res.headers.link.split(/,/);
			for (let l in links) {
				let link = links[l];
				let components = link.split(/;/);
				if (components[1].trim() === 'rel="next"') {
					let url = components[0].substr(1, components[0].length - 2).substr(8);
					let cut = url.indexOf('/');
					let options = {
						host: url.substr(0, cut),
						path: url.substr(cut),
						headers: {'User-Agent': 'Kit'}
					};
					++serverCount;
					https.get(options, function (res) { getServerInfo(res, server, serverPrio, serverData, page + 1, callback); }).on("error", function(e) {
						log.error(server.name + ": Could not load additional projects data.");
						finishServer(callback);
					});
					break;
				}
			}
		}

		res.setEncoding("utf8");
		let data = "";
		res.on("data", function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
			var repositories;
			if (server.type === 'github') {
				if (res.statusCode === 304) {
					repositories = serverData.repositories;
				}
				else if (res.statusCode !== 200) {
					try {
						var result = JSON.parse(data);
						log.error(server.name + ": " + result.message + " (" + result.documentation_url + ")");
					} catch (e) {
						log.error(server.name + ": Unknown error.");
					}
					finishServer(callback);
					return;
				}
				else {
					result = JSON.parse(data);
					if (page === 0) {
						repositories = [];
						serverData.etag = res.headers.etag;
						serverData.repositories = repositories;
					}
					else {
						repositories = serverData.repositories;
					}
					for (var r in result) {
						repositories.push(result[r].name.trim());
					}
					config.saveServerData(server.name);
				}
				for (var r in repositories) {
					let name = repositories[r].trim();
					let project = {name: name, server: server, prio: serverPrio, baseurl: 'https://github.com/' + server.path.split(/\//)[1] + '/', others: []};
					addProject(project, serverPrio, projects);
				}
				finishServer(callback);
			}
			else if (server.type === 'gitblit') {
				repositories = JSON.parse(data);
				for (var r in repositories) {
					var repo = repositories[r];
					let name = repo.name.substr(0, repo.name.length - 4).trim();
					let project = {name: name, server: server, prio: serverPrio, baseurl: 'https://' + server.url + '/r/', others: []};
					addProject(project, serverPrio, projects);
				}
				finishServer(callback);
			}
		});
	}

	var exports = {};

	exports.addChangeCallbacks = function (callback) {
		changeCallbacks.push(callback);
	};

	exports.removeChangeCallback = function (callback) {
		changeCallbacks.remove(callback);
	};

	exports.execute = function (parameters, callback) {
		projects = {};
		serverCount = config.servers().length;

		let serverNum = 0;
		for (var s in config.servers()) {
			let server = config.servers()[s];
			let serverData = config.serverData(server.name);
			let serverPrio = serverNum;
			++serverNum;

			let options = {};
			if (server.type === 'github') {
				options = {
					host: 'api.github.com',
					path: '/' + server.path + '/repos',
					headers: {'User-Agent': 'Kit'}
				};
				if (serverData.etag) {
					options.headers['If-None-Match'] = serverData.etag;
				}
			}
			else if (server.type === 'gitblit') {
				options = {
					rejectUnauthorized: false,
					host: server.url,
					path: '/rpc?req=LIST_REPOSITORIES',
					headers: {
						'User-Agent': 'Kit',
						'Authorization': 'Basic ' + new Buffer(server.user + ':' + server.pass).toString('base64')
					}
				};
			}

			https.get(options, function (res) { getServerInfo(res, server, serverPrio, serverData, 0, callback); }).on("error", function(e) {
				log.info(server.name + ": Could not download list of projects for Server.");
				finishServer(callback);
			});
		}
	};

	return exports;
});

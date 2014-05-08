"use strict";

//var git = require("kit-git");
var os = require("os");
var git = require("../git.js");
var fs = require("fs");
var http = require("http");
var https = require("https");
var log = require("../log.js");
var page = require("../page.js");
var config = require("../config.js");
var projectPage = require("./project.js");

var document = window.document;

function remove(array, at) {
	var rest = array.slice(at + 1);
	array.length = at < 0 ? array.length + at : at;
	return array.push.apply(array, rest);
}

function Button(text) {
	this.element = document.createElement("button");
	this.element.appendChild(document.createTextNode(text));
}

function contains(array, value) {
	for (var v in array) {
		if (array[v] === value) return true;
	}
	return false;
}

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
		
	}
	for (var p in projects) {
		var project = projects[p];
		if (project === null
			|| project.name.endsWith("/")
			|| project.name.startsWith("Archive/")
			) {
			delete projects[p];
			continue;
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
var table;

function clear(element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

exports.redraw = function () {
	clear(table);
	for (let r in repoarray) {
		let project = repoarray[r];

		if (!project.available && config.hideUnavailable()) continue;

		var tr = document.createElement("tr");

		var td = document.createElement("td");
		td.appendChild(document.createTextNode(project.name));
		tr.appendChild(td);
		
		td = document.createElement("td");
		let button = null;
		if (project.available) {
			button = new Button("Update");
		}
		else {
			button = new Button("Download");
		}
		
		td.appendChild(button.element);
		tr.appendChild(td);

		td = document.createElement("td");
		let openButton = new Button("Open");
		
		openButton.element.onclick = function() {
			projectPage.load(project.name);
		};

		button.element.onclick = function() {
			document.getElementById("kitt").style.visibility = "visible";
			kittanimated = true;
			animate();
			git.update(project, projects, config.projectsDirectory() + "/",
				function() {
					document.getElementById("kitt").style.visibility = "hidden";
					kittanimated = false;
					button.element.removeChild(button.element.lastChild);
					button.element.appendChild(document.createTextNode("Update"));
					openButton.element.disabled = false;
				}
			);
		};

		if (!project.available) openButton.element.disabled = true;
		td.appendChild(openButton.element);
		tr.appendChild(td);

		table.appendChild(tr);
	}
};

function addProjects() {
	repoarray = [];
	for (var p in projects) {
		repoarray.push(projects[p]);
	}
	repoarray.sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });

	exports.redraw();
}

var serverCount;

function finishServer() {
	--serverCount;
	if (serverCount === 0) {
		log.info("Downloaded list of projects.");
		findProjectDirs(projects);
		addProjects(projects);
	}
}

function getServerInfo(res, server, serverPrio) {
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
				https.get(options, function (res) { getServerInfo(res, server, serverPrio); }).on("error", function(e) {
					log.error("Could not load additional projects data.");
				});;
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
		if (server.type === 'github') {
			var repositories = JSON.parse(data);
			for (var r in repositories) {
				let name = repositories[r].name.trim();
				let project = {name: name, server: server, prio: serverPrio, baseurl: 'https://github.com/' + server.path.split(/\//)[1] + '/', others: []};
				if (projects[name] === undefined) {
					projects[name] = project;
				}
				else if (projects[name].prio < serverPrio) {
					for (var o in projects[name].others) {
						project.others.push(projects[name].others[o]);
					}
					projects[name].others = [];
					project.others.push(projects[name]);
					projects[name] = project;
				}
				else {
					projects[name].others.push(project);
				}
			}
			finishServer();
		}
		else if (server.type === 'gitblit') {
			var repositories = JSON.parse(data);
			for (var r in repositories) {
				var repo = repositories[r];
				let name = repo.name.substr(0, repo.name.length - 4).trim();
				let project = {name: name, server: server, prio: serverPrio, baseurl: 'https://' + server.url + '/r/', others: []};
				if (projects[name] === undefined) {
					projects[name] = project;
				}
				else if (projects[name].prio < serverPrio) {
					for (var o in projects[name].others) {
						project.others.push(projects[name].others[o]);
					}
					projects[name].others = [];
					project.others.push(projects[name]);
					projects[name] = project;
				}
				else {
					projects[name].others.push(project);
				}
			}
			finishServer();
		}
	});
}

function loadRepositories() {
	projects = {};
	serverCount = config.servers().length;

	let serverNum = 0;
	for (var s in config.servers()) {
		let server = config.servers()[s];
		let serverPrio = serverNum;
		++serverNum;

		let options = {};
		if (server.type === 'github') {
			options = {
				host: 'api.github.com',
				path: '/' + server.path + '/repos',
				headers: {'User-Agent': 'Kit'}
			};
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

		https.get(options, function (res) { getServerInfo(res, server, serverPrio); }).on("error", function(e) {
			log.info("Could not download list of projects.");
			projects = {};
			findProjectDirs();
			addProjects();
		});
	}
}

exports.load = function() {
	page.clear();
	table = document.createElement("table");
	var content = document.getElementById("content");
	content.appendChild(table);

	var tr = document.createElement("tr");
	var td = document.createElement("td");
	var input = document.createElement("input");
	td.appendChild(input);
	tr.appendChild(td);
	td = document.createElement("td");
	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Create project"));
	td.appendChild(button);
	tr.appendChild(td);
	//table.appendChild(tr);

	button.onclick = function() {
		fs.mkdirSync(config.projectsDirectory() + "/" + input.value);

		fs.writeFileSync(
			config.projectsDirectory() + "/" + input.value + "/.gitignore",
			"/build\n/kake.lua\n"
		);
		
		fs.writeFileSync(
			config.projectsDirectory() + "/" + input.value + "/project.kha",
			JSON.stringify({ format: 1, game: { name: input.value, width: 640, height: 480}, assets: [], rooms: []}, null, "\t")
		);
		
		fs.mkdirSync(config.projectsDirectory() + "/" + input.value + "/Sources");
			
		fs.writeFileSync(
			config.projectsDirectory() + "/" + input.value + "/Sources/Main.hx",
			"package;\n\n"
			+ "import kha.Starter;\n\n"
			+ "class Main {\n"
			+ "\tpublic static function main() {\n"
			+ "\t\tnew Starter().start(new " + input.value + "());\n"
			+ "\t}\n"
			+ "}"
		);	
		
		fs.writeFileSync(
			config.projectsDirectory() + "/" + input.value + "/Sources/" + input.value + ".hx",
			"package;\n\n"
			+ "import kha.Game;\n\n"
			+ "class " + input.value + " extends Game {\n"
			+ "\tpublic function new() {\n"
			+ "\t\tsuper(\"" + input.value + "\", false);"
			+ "\t}"
			+ "}"
		);
		
		fs.writeFileSync(
			config.projectsDirectory() + "/" + input.value + "/.gitmodules",
			'[submodule "Kha"]\n\tpath = Kha\n\turl = ../Kha\n\tbranch = master'
		);
	};

	loadRepositories();
};

var kittcount = 0;
var kittanimated = false;

function animate() {
	var kitt = document.getElementById("kitt");

	++kittcount;
	var kittx = (Math.sin(kittcount / 100) + 1) / 2 * (window.innerWidth - 100);

	if (kitt !== null) {
		kitt.style.top = window.innerHeight - 20 + 'px';
		kitt.style.left = kittx + 'px';
	}
	if (kittanimated) window.requestAnimationFrame(animate);
}

"use strict";

//var git = require("kit-git");
var os = require("os");
var git = require("kit-git-" + os.platform());
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

function findProjectDirs(repositories) {
	var projects = [];
	var dirs = [];
	try {
		dirs = fs.readdirSync(config.projectsDirectory());
	}
	catch (e) {
		
	}
	if (repositories !== undefined) {
		for (var repo in repositories) {
			if (repositories[repo] === null
				|| repositories[repo].name.endsWith("/")
				|| repositories[repo].name.startsWith("Archive/")
				) continue;

			if (contains(dirs, repositories[repo].name)) {
				remove(dirs, dirs.indexOf(repositories[repo].name));
				projects.push({project: repositories[repo].name, available: true});
			}
			else {
				projects.push({project: repositories[repo].name, available: false});
			}
		}
	}
	for (var dir in dirs) {
		if (fs.existsSync(config.projectsDirectory() + "/" + dirs[dir] + "/Kore")
			|| fs.existsSync(config.projectsDirectory() + "/" + dirs[dir] + "/Kt")
			|| fs.existsSync(config.projectsDirectory() + "/" + dirs[dir] + "/Kha")) {
			projects.push({project: dirs[dir], available: true});
		}
	}
	return projects;
}

function addProjects(projects, table) {
	for (let project in projects) {
		var tr = document.createElement("tr");

		var td = document.createElement("td");
		td.appendChild(document.createTextNode(projects[project].project));
		tr.appendChild(td);
		
		td = document.createElement("td");
		let button = null;
		if (projects[project].available) {
			button = new Button("Update");
		}
		else {
			button = new Button("Download");
		}
		button.element.onclick = function() {
			document.getElementById("kitt").style.visibility = "visible";
			kittanimated = true;
			animate();
			git.update(projects[project].project, "https://github.com/KTXSoftware/", config.projectsDirectory() + "/",
				function() {
					document.getElementById("kitt").style.visibility = "hidden";
					kittanimated = false;
					button.element.removeChild(button.element.lastChild);
					button.element.appendChild(document.createTextNode("Update"));
				}
			);
		};
		td.appendChild(button.element);
		tr.appendChild(td);

		td = document.createElement("td");
		var openButton = new Button("Open");
		openButton.element.onclick = function() {
			projectPage.load(projects[project].project);
		};
		if (!projects[project].available) openButton.element.disabled = true;
		td.appendChild(openButton.element);
		tr.appendChild(td);

		table.appendChild(tr);
	}
}

function loadRepositories(table) {
	var options = {
		host: "api.github.com",
		path: "/orgs/ktxsoftware/repos",
		headers: {"User-Agent": "RobDangerous"},
	};
	https.get(options, function(res) {
	//http.get("http://dev.ktxsoftware.com/kit.json?username=" + config.username() + "&password=" + config.password(), function(res) {
		log.info("Downloaded list of projects.");
		res.setEncoding("utf8");
		let data = "";
		res.on("data", function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
			var repositories = JSON.parse(data);
			repositories.sort(function(a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
			addProjects(findProjectDirs(repositories), table);
		});
	}).on("error", function(e) {
		log.error("Could not download list of projects.");
		addProjects(findProjectDirs(), table);
	});
}

exports.load = function() {
	page.clear();
	var table = document.createElement("table");
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

	loadRepositories(table);
}

var kittx = 0;
var kittleft = false;
var kittanimated = false;

function animate() {
	var kitt = document.getElementById("kitt");
	var kittspeed = 5;
	if (kittleft) {
		kittx -= kittspeed;
	}
	else {
		kittx += kittspeed;
	}
	if (kittx > window.innerWidth - 100) {
		kittleft = true;
		kittx = window.innerWidth - 100;
	}
	if (kittx < 0) {
		kittleft = false;
		kittx = 0;
	}
	if (kitt !== null) kitt.style.left = kittx + "px";
	if (kittanimated) window.requestAnimationFrame(animate);
}

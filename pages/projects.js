"use strict";

var fs = require("fs");
var http = require("http");
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
	var dirs = fs.readdirSync(config.projectsDirectory());
	if (repositories !== undefined) {
		for (var repo in repositories) {
			if (repositories[repo] === null
				|| repositories[repo].endsWith("/")
				|| repositories[repo].startsWith("Archive/")
				) continue;

			if (contains(dirs, repositories[repo])) {
				remove(dirs, dirs.indexOf(repositories[repo]));
				projects.push({project: repositories[repo], available: true});
			}
			else {
				projects.push({project: repositories[repo], available: false});
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
		if (projects[project].available) var button = new Button("Update");
		else var button = new Button("Download");
		td.appendChild(button.element);
		tr.appendChild(td);

		td = document.createElement("td");
		var button = new Button("Open");
		button.element.onclick = function() {
			projectPage.load(projects[project].project);
		};
		if (!projects[project].available) button.element.disabled = true;
		td.appendChild(button.element);
		tr.appendChild(td);

		table.appendChild(tr);
	}
}

function loadRepositories(table) {
	http.get("http://dev.ktxsoftware.com/kit.json?username=" + config.username() + "&password=" + config.password(), function(res) {
		log.info("Downloaded list of projects.");
		res.setEncoding("utf8");
		let data = "";
		res.on("data", function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
			addProjects(findProjectDirs(JSON.parse(data).repositories), table);
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
	loadRepositories(table);
}

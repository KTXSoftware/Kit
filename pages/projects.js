"use strict";

var fs = require("fs");
var http = require("http");
var log = require("../log.js");
var page = require("../page.js");
var config = require("../config.js");
var projectPage = require("./project.js");

var document = window.document;

function remove(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

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
	for (var dir in dirs) {
		log.info("Testing: " + config.projectsDirectory() + "/" + dirs[dir] + "/Kha");
		if (fs.existsSync(config.projectsDirectory() + "/" + dirs[dir] + "/Kore")
			|| fs.existsSync(config.projectsDirectory() + "/" + dirs[dir] + "/Kt")
			|| fs.existsSync(config.projectsDirectory() + "/" + dirs[dir] + "/Kha")) {
			projects.push({project: dirs[dir], available: true});
		}
	}
	return projects;
}

function loadRepositories(table) {
	http.get("http://dev.ktxsoftware.com/kit.json?username=" + config.username() + "&password=" + config.password(), function(res) {
		log.info("STATUS: " + res.statusCode);
		res.setEncoding("utf8");
		let data = "";
		res.on("data", function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
			//log.info("BODY: " + data);
			//try {
				var repositories = JSON.parse(data).repositories;
				var projects = findProjectDirs(repositories);
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
			//}
			//catch (error) {

			//}
		});
	}).on("error", function(e) {
		console.log("Got error: " + e.message);
	});
}

exports.load = function() {
	page.clear();
	var table = document.createElement("table");
	var content = document.getElementById("content");
	content.appendChild(table);
	loadRepositories(table);
}

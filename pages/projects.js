"use strict";

var http = require("http");
var page = require("../page.js");
var config = require("../config.js");
var projectPage = require("./project.js");

var document = window.document;

function Button(text) {
	this.element = document.createElement("button");
	this.element.appendChild(document.createTextNode(text));
}

function loadRepositories(table) {
	http.get("http://dev.ktxsoftware.com/kit.json?username=" + config.username() + "&password=" + config.password(), function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		let data = "";
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			//console.log('BODY: ' + data);
			try {
				var repositories = JSON.parse(data).repositories;
				for (let repo in repositories) {
					if (repositories[repo] === null || repositories[repo].endsWith("/")) continue;
					var tr = document.createElement("tr");

					var td = document.createElement("td");
					td.appendChild(document.createTextNode(repositories[repo]));
					tr.appendChild(td);
					
					td = document.createElement("td");
					var button = new Button("Update");
					td.appendChild(button.element);
					tr.appendChild(td);

					td = document.createElement("td");
					var button = new Button("Open");
					button.element.onclick = function() {
						projectPage.load(repositories[repo]);
					};
					td.appendChild(button.element);
					tr.appendChild(td);

					table.appendChild(tr);
				}
			}
			catch (error) {

			}
		});
	}).on('error', function(e) {
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

var page = require("../page.js");
var projectPage = require("../projectPages/project.js");
var assetsPage  = require("../projectPages/assets.js");
var roomsPage   = require("../projectPages/rooms.js");

var document = window.document;

function clear(element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

exports.load = function(repository) {
	page.clear();
	var content = document.getElementById("content");

	var table = document.createElement("table");
	var tr = document.createElement("tr");
	var td = document.createElement("td");

	var projectButton = document.createElement("button");
	projectButton.appendChild(document.createTextNode(repository));
	td.appendChild(projectButton);
	var assetsButton = document.createElement("button");
	assetsButton.appendChild(document.createTextNode("Assets"));
	td.appendChild(assetsButton);
	roomsButton = document.createElement("button");
	roomsButton.appendChild(document.createTextNode("Rooms"));
	td.appendChild(roomsButton);
	tr.appendChild(td);
	table.appendChild(tr);

	tr = document.createElement("tr");
	td = document.createElement("td");
	
	projectButton.onclick = function() {
		clear(td);
		projectPage.load(repository, td);
	};
	assetsButton.onclick = function() {
		clear(td);
		assetsPage.load(repository, td);
	};
	roomsButton.onclick = function() {
		clear(td);
		roomsPage.load(repository, td);
	};

	projectPage.load(repository, td);

	tr.appendChild(td);
	table.appendChild(tr);

	content.appendChild(table);
}

var page = require("../page.js");
var log = require("../log.js");

var document = window.document;

function createRow1(element) {
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.appendChild(element);
	tr.appendChild(td);
	return tr;
}

exports.load = function() {
	page.clear();
	var table = document.createElement("table");

	for (var row in log.lines) {
		table.appendChild(createRow1(document.createTextNode(log.lines[row].text)));
	}

	var content = document.getElementById("content");
	content.appendChild(table);
}

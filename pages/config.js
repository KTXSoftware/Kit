var page = require("../page.js");
var config = require("../config.js");
var md5 = require("../md5.js");

var document = window.document;

function createRow2(left, right) {
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.appendChild(left);
	tr.appendChild(td);
	td = document.createElement("td");
	td.appendChild(right);
	tr.appendChild(td);
	return tr;
}

exports.load = function() {
	page.clear();
	var table = window.document.createElement("table");

	/*var input = document.createElement("input");
	input.onchange = function() {
		config.setUsername(input.value);
	};
	table.appendChild(createRow2(document.createTextNode("Username"), input));

	var input2 = document.createElement("input");
	input2.setAttribute("type", "password");
	input2.onchange = function() {
		config.setPassword(md5(input2.value));
	}
	table.appendChild(createRow2(document.createTextNode("Password"), input2));
	*/
	var projectsDirButton = document.createElement("input");
	projectsDirButton.setAttribute("type", "file");
	projectsDirButton.setAttribute("nwdirectory");
	projectsDirButton.onchange = function() {
		config.setProjectsDirectory(projectsDirButton.value);
	}
	table.appendChild(createRow2(document.createTextNode("Projects directory"), projectsDirButton));

	var input = document.createElement("input");
	input.value = config.mp3Encoder();
	input.onkeyup = function() {
		config.setMP3Encoder(input.value);
	};
	table.appendChild(createRow2(document.createTextNode("MP3 encoder"), input));

	var input2 = document.createElement("input");
	input2.value = config.aacEncoder();
	input2.onkeyup = function() {
		config.setAACEncoder(input2.value);
	}
	table.appendChild(createRow2(document.createTextNode("AAC encoder"), input2));

	var input3 = document.createElement("input");
	input3.value = config.git();
	input3.onkeyup = function() {
		config.setGit(input3.value);
	}
	table.appendChild(createRow2(document.createTextNode("Git command"), input3));

	//table.appendChild(createRow2(document.createTextNode("Android Devkit"), document.createTextNode("_")));
	//table.appendChild(createRow2(document.createTextNode("Visual Studio"), document.createTextNode("_")));
	//table.appendChild(createRow2(document.createTextNode("Windows Graphics"), document.createTextNode("_")));
	//table.appendChild(createRow2(document.createTextNode("Precompiled Headers"), document.createTextNode("_")));
	//table.appendChild(createRow2(document.createTextNode("Intermediate Drive"), document.createTextNode("_")));
	
	var content = document.getElementById("content");
	content.appendChild(table);
}

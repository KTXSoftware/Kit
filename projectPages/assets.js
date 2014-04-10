"use strict";

var config = require("../config.js");
var fs = require("fs");
var uuid = require("node-uuid");

var document = window.document;

function clear(element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

function remove(array, at) {
	var rest = array.slice(at + 1);
	array.length = at < 0 ? array.length + at : at;
	return array.push.apply(array, rest);
}

function loadAssets(kha, assets, type, element) {
	clear(element);
	var table = document.createElement("table");
	for (var asset in assets) {
		let current = assets[asset];
		if (assets[asset].type === type) {
			var tr = document.createElement("tr");
			var td = document.createElement("td");

			var a = document.createElement("a");
			a.setAttribute("href", "#");
			a.onclick = function() {
				//window.alert("click");
				return false;
			};
			a.appendChild(document.createTextNode(assets[asset].name));
			td.appendChild(a);
			tr.appendChild(td);

			td = document.createElement("td");
			var button = document.createElement("button");
			button.appendChild(document.createTextNode("-"));
			button.onclick = function() {
				for (var asset in assets) {
					if (assets[asset].type === type && assets[asset].name === current.name) {
						remove(assets, assets.indexOf(assets[asset]));
						kha.save();
						loadAssets(assets, type, element);
						return;
					}
				}
			};
			td.appendChild(button);
			tr.appendChild(td);
			table.appendChild(tr);
		}
	}
	element.appendChild(table);
}

function copyFile(from, to) {
	var data = fs.readFileSync(from);
	fs.writeFileSync(to, data);
}

exports.load = function(repository, kha, element) {
	var select = document.createElement("select");

	var option = document.createElement("option");
	option.appendChild(document.createTextNode("Images"));
	select.appendChild(option);
	
	option = document.createElement("option");
	option.appendChild(document.createTextNode("Music"));
	select.appendChild(option);
	
	option = document.createElement("option");
	option.appendChild(document.createTextNode("Sounds"));
	select.appendChild(option);

	option = document.createElement("option");
	option.appendChild(document.createTextNode("Blobs"));
	select.appendChild(option);

	var div = document.createElement("div");
	
	select.onchange = function() {
		switch (select.selectedIndex) {
		case 0:
			loadAssets(kha, kha.assets, "image", div);
			break;
		case 1:
			loadAssets(kha, kha.assets, "music", div);
			break;
		case 2:
			loadAssets(kha, kha.assets, "sound", div);
			break;
		case 3:
			loadAssets(kha, kha.assets, "blob", div);
			break;
		}
	};

	element.appendChild(select);

	element.appendChild(document.createElement("br"));

	var button = document.createElement("input");
	button.appendChild(document.createTextNode("Add Image..."));
	button.setAttribute("type", "file");
	button.onchange = function() {
		var dir = "/Assets/"
		switch (select.selectedIndex) {
		case 0:
			dir += "Graphics/";
			break;
		case 1:
		case 2:
			dir += "Sound/";
			break;
		}
		var value = button.value.replace(/\\/g, "/");
		var name = value.substr(value.lastIndexOf("/") + 1);
		copyFile(value, config.projectsDirectory() + "/" + repository + dir + name);
		var shortname = name.substring(0, name.lastIndexOf("."));
		var type = "image";
		switch (select.selectedIndex) {
		case 1:
			type = "music";
			break;
		case 2:
			type = "sound";
			break;
		case 3:
			type = "blob";
			break;
		}
		kha.assets.push( {
			id: uuid.v4(),
      		type: type,
      		file: name,
      		name: shortname
		});
		kha.save();
		loadAssets(kha, kha.assets, type, div);
	};
	element.appendChild(button);
	element.appendChild(div);

	if (kha !== undefined) {
		loadAssets(kha, kha.assets, "image", div);
	}
}

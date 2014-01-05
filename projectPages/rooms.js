"use strict";

var uuid = require("node-uuid");

var document = window.document;

var roomsColumn;

function clear(element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

function findAsset(kha, assetId) {
	for (var asset in kha.assets) {
		if (kha.assets[asset].id === assetId) {
			return kha.assets[asset];
		}
	}
}

function contains(room, asset) {
	for (var assetId in room.assets) {
		if (asset.id === room.assets[assetId]) return true;
	}
	return false;
}

function arrayRemove(array, at) {
	var rest = array.slice(at + 1);
	array.length = at < 0 ? array.length + at : at;
	return array.push.apply(array, rest);
}

function remove(room, asset, table, line) {
	for (var assetId in room.assets) {
		if (asset.id === room.assets[assetId]) {
			arrayRemove(room.assets, room.assets.indexOf(room.assets[assetId]));
			return;
		}
	}
}

function addLine(kha, room, asset, table) {
	let line = document.createElement("tr");
	let td = document.createElement("td");
	td.appendChild(document.createTextNode(asset.name));
	line.appendChild(td);

	td = document.createElement("td");
	var button = document.createElement("button");
	button.appendChild(document.createTextNode("-"));
	button.onclick = function() {
		remove(room, asset, table, line);
		loadRoom(kha, room);
	};
	td.appendChild(button);
	line.appendChild(td);
	table.appendChild(line);
}

function loadAssets(kha, room, type, title, table) {
	var tr = document.createElement("tr");
	var td = document.createElement("td");

	var h = document.createElement("h3");
	h.appendChild(document.createTextNode(title));
	td.appendChild(h);
	tr.appendChild(td);
	table.appendChild(tr);

	tr = document.createElement("tr");
	td = document.createElement("td");
	var select = document.createElement("select");
	
	for (var asset in kha.assets) {
		if (kha.assets[asset].type === type && !contains(room, kha.assets[asset])) {
			var option = document.createElement("option");
			option.appendChild(document.createTextNode(kha.assets[asset].name));
			option.setAttribute("value", kha.assets[asset].id);
			select.appendChild(option);
		}
	}

	select.onchange = function() {
		var value = select.options[select.selectedIndex].value;
		room.assets.push(value);
		loadRoom(kha, room);
	};
	
	td.appendChild(select);
	tr.appendChild(td);
	table.appendChild(tr);

	for (var id in room.assets) {
		let asset = findAsset(kha, room.assets[id]);
		if (asset.type === type) {
			addLine(kha, room, asset, table);
		}
	}
}

function loadRoom(kha, room) {
	clear(roomsColumn);
	var table = document.createElement("table");
	loadAssets(kha, room, "image", "Images", table);
	loadAssets(kha, room, "sound", "Sounds", table);
	loadAssets(kha, room, "music", "Music", table);
	loadAssets(kha, room, "blob", "Blobs", table);
	roomsColumn.appendChild(table);
}

function addRoom(kha, room, td) {
	td.appendChild(document.createElement("br"));
	var a = document.createElement("a");
	a.setAttribute("href", "#");
	a.onclick = function() {
		loadRoom(kha, room);
		return false;
	};
	a.appendChild(document.createTextNode(room.name));
	td.appendChild(a);
}

exports.load = function(repository, kha, element) {
	var table = document.createElement("table");
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.setAttribute("valign", "top");

	var input = document.createElement("input");
	td.appendChild(input);

	td.appendChild(document.createElement("br"));

	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Add room"));
	td.appendChild(button);

	button.onclick = function() {
		let room = {
			id : uuid.v4(),
			name: input.value,
			parent: null,
			neighbours: [],
			assets: []
		};
		kha.rooms.push(room);
		addRoom(kha, room, td);
	};

	if (kha !== undefined) {
		for (let room in kha.rooms) {
			addRoom(kha, kha.rooms[room], td);
		}
	}

	tr.appendChild(td);

	roomsColumn = document.createElement("td");
	roomsColumn.setAttribute("valign", "top");
	tr.appendChild(roomsColumn);

	table.appendChild(tr);
	element.appendChild(table);
}

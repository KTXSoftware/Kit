"use strict";

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

function loadAssets(kha, room, type, title) {
	var h = document.createElement("h3");
	h.appendChild(document.createTextNode(title));
	roomsColumn.appendChild(h);

	for (var id in room.assets) {
		var asset = findAsset(kha, room.assets[id]);
		if (asset.type === type) {
			roomsColumn.appendChild(document.createTextNode(asset.name));
			var button = document.createElement("button");
			button.appendChild(document.createTextNode("-"));
			button.onclick = function() {
				
			};
			roomsColumn.appendChild(button);
			roomsColumn.appendChild(document.createElement("br"));
		}
	}
}

function loadRoom(kha, room) {
	clear(roomsColumn);
	loadAssets(kha, room, "image", "Images");
	loadAssets(kha, room, "sound", "Sounds");
	loadAssets(kha, room, "music", "Music");
	loadAssets(kha, room, "blob", "Blobs");
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

	if (kha !== undefined) {
		for (let room in kha.rooms) {
			td.appendChild(document.createElement("br"));
			var a = document.createElement("a");
			a.setAttribute("href", "#");
			a.onclick = function() {
				loadRoom(kha, kha.rooms[room]);
				return false;
			};
			a.appendChild(document.createTextNode(kha.rooms[room].name));
			td.appendChild(a);
		}
	}

	tr.appendChild(td);

	roomsColumn = document.createElement("td");
	roomsColumn.setAttribute("valign", "top");
	tr.appendChild(roomsColumn);

	table.appendChild(tr);
	element.appendChild(table);
}

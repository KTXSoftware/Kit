var document = window.document;

function clear(element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

function loadAssets(assets, type, element) {
	clear(element);
	for (var asset in assets) {
		if (assets[asset].type === type) {
			element.appendChild(document.createElement("br"));
			var a = document.createElement("a");
			a.setAttribute("href", "#");
			a.onclick = function() {
				//window.alert("click");
				return false;
			};
			a.appendChild(document.createTextNode(assets[asset].name));
			element.appendChild(a);
		}
	}
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
			loadAssets(kha.assets, "image", div);
			break;
		case 1:
			loadAssets(kha.assets, "music", div);
			break;
		case 2:
			loadAssets(kha.assets, "sound", div);
			break;
		case 3:
			loadAssets(kha.assets, "blob", div);
			break;
		}
	};

	element.appendChild(select);

	element.appendChild(document.createElement("br"));

	var button = document.createElement("input");
	button.appendChild(document.createTextNode("Add Image..."));
	button.setAttribute("type", "file");
	button.onchange = function() {

	};
	element.appendChild(button);
	element.appendChild(div);

	if (kha !== undefined) {
		loadAssets(kha.assets, "image", div);
	}
}

var document = window.document;

exports.load = function(repository, kha, element) {
	var input = document.createElement("input");
	element.appendChild(input);

	element.appendChild(document.createElement("br"));

	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Add room"));
	element.appendChild(button);

	if (kha !== undefined) {
		for (var room in kha.rooms) {
			element.appendChild(document.createElement("br"));
			element.appendChild(document.createTextNode(kha.rooms[room].name));
		}
	}
}

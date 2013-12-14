var document = window.document;

exports.load = function(repository, element) {
	var input = document.createElement("input");
	element.appendChild(input);

	element.appendChild(document.createElement("br"));

	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Add room"));
	element.appendChild(button);
}

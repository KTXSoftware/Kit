var document = window.document;

exports.load = function(repository, element) {
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

	element.appendChild(select);

	element.appendChild(document.createElement("br"));

	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Add Image..."));
	element.appendChild(button);

	
}

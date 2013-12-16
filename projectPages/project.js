var document = window.document;

exports.load = function(repository, kha, element) {
	var select = document.createElement("select");
	var option = document.createElement("option");
	option.appendChild(document.createTextNode("Flash"));
	select.appendChild(option);
	option = document.createElement("option");
	option.appendChild(document.createTextNode("HTML5"));
	select.appendChild(option);
	option = document.createElement("option");
	option.appendChild(document.createTextNode("Windows"));
	select.appendChild(option);
	element.appendChild(select);

	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Compile Assets"));
	element.appendChild(button);

	button = document.createElement("button");
	button.appendChild(document.createTextNode("Launch Project"));
	element.appendChild(button);
}

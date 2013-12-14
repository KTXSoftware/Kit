function clear(element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

exports.clear = function() {
	clear(window.document.getElementById("content"));
}

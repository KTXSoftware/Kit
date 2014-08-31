define(function () {
	var div = document.createElement('div');
	return {
		div: div,
		info: function (text) {
			div.appendChild(document.createTextNode(text));
			div.appendChild(document.createElement('br'));
		},
		error: function (text) {
			document.getElementById('logButton').className = 'alert';
			var span = document.createElement('span');
			span.style.color = '#ff0000';
			span.appendChild(document.createTextNode(text));
			div.appendChild(span);
			div.appendChild(document.createElement('br'));
		}
	};
});

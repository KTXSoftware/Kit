define(function () {
	return {
		div: document.createElement('div'),
		info: function (text) {
			this.div.appendChild(document.createTextNode(text));
			this.div.appendChild(document.createElement('br'));
		},
		error: function (text) {
			document.getElementById('logButton').className = 'alert';
			var span = document.createElement('span');
			span.style.color = '#ff0000';
			span.appendChild(document.createTextNode(text));
			this.div.appendChild(span);
			this.div.appendChild(document.createElement('br'));
		}
	};
});

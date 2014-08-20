define(function () {
	return {
		text: '',
		info: function (text) {
			this.text += text + '\n';
			//this.lines.push({ level: 0, text: text });
		},
		error: function (text) {
			document.getElementById('logButton').className = 'alert';
			this.text += text + '\n';
			//this.lines.push({ level: 1, text: text });
		}
	};
});

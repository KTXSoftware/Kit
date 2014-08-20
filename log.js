define(function () {
	return {
		button: null,
		lines: [],
		init: function (logButton) {
			this.button = logButton;
		},
		info: function (text) {
			this.lines.push({ level: 0, text: text });
			//logPage.update();
		},
		error: function (text) {
			this.button.className = 'alert';
			this.lines.push({ level: 1, text: text });
			//logPage.update();
		}
	};
});

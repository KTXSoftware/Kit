var logPage = require("./pages/log.js");

exports.lines = [];

var button;

exports.init = function (logButton) {
	button = logButton;
};

exports.info = function(text) {
	exports.lines.push({ level: 0, text: text });
	logPage.update();
};

exports.error = function(text) {
	button.className = 'alert';
	exports.lines.push({ level: 1, text: text });
	logPage.update();
};

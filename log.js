var logPage = require("./pages/log.js");

exports.lines = [];

exports.info = function(text) {
	exports.lines.push({ level: 0, text: text });
	logPage.update();
};

exports.error = function(text) {
	exports.lines.push({ level: 1, text: text });
	logPage.update();
};

exports.lines = [];

exports.info = function(text) {
	exports.lines.push({ level: 0, text: text });
}

exports.error = function(text) {
	exports.lines.push({ level: 1, text: text });
}

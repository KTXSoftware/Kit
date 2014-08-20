define(['../log.js', '../react.js'], function (log, React) {
	var Log = React.createClass({displayName: 'Log',
		render: function () {
			var rows = [];
			for (var l in log.lines) {
				rows.push(React.DOM.tr(null, React.DOM.td(null, log.lines[l].text)));
			}
			return React.DOM.table(null, rows);
		}
	});

	return Log;
});

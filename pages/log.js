define(['../log.js', '../react.js'], function (log, React) {
	var Log = React.createClass({displayName: 'Log',
		getInitialState: function () {
			return {text: log.text};
		},
		componentDidMount: function () {
			var self = this;
			if (document.getElementById('log').firstChild !== log.div) document.getElementById('log').appendChild(log.div);
			this.interval = setInterval(function () { self.setState({text: log.text}); }, 500);
		},
		componentWillUnmount: function () {
			clearInterval(this.interval);
		},
		render: function () {
			//var rows = [];
			//for (var l in log.lines) {
			//	rows.push(React.DOM.tr({key: l}, React.DOM.td(null, log.lines[l].text)));
			//}
			//return React.DOM.table(null, rows);
			//return React.DOM.pre(null, this.state.text);
			return React.DOM.div({id: 'log'});
		}
	});

	return Log;
});

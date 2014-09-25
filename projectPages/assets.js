"use strict";

define(['../config.js', '../react.js'], function (config, React) {
	var fs = require("fs");
	var path = require('path');
	var uuid = require("node-uuid");

	function remove(array, at) {
		var rest = array.slice(at + 1);
		array.length = at < 0 ? array.length + at : at;
		return array.push.apply(array, rest);
	}

	function copyFile(from, to) {
		var todir = path.dirname(to);
		if (!fs.existsSync(todir)) fs.mkdirSync(todir);
		var data = fs.readFileSync(from);
		fs.writeFileSync(to, data);
	}

	return React.createClass({displayName: 'AssetsPage',
		getInitialState: function () {
			return {type: 'image'};
		},
		selection: function (event) {
			this.setState({type: event.target.value});
		},
		render: function () {
			var self = this;
			var rows = [];
			for (var asset in this.props.kha.assets) {
				let current = this.props.kha.assets[asset];
				if (current.type === this.state.type) {
					var tr = React.DOM.tr(null,
						React.DOM.td(null,
							React.DOM.a({href: '#', onClick: function () { return false; }}, current.name)
						),
						React.DOM.td(null,
							React.DOM.button({onClick: function () {
								for (var a in self.props.kha.assets) {
									let asset = self.props.kha.assets[a];
									if (asset.type === current.type && asset.name === current.name) {
										remove(self.props.kha.assets, self.props.kha.assets.indexOf(asset));
										self.props.kha.save();
										self.forceUpdate();
										return;
									}
								}		
							}}, '-')
						)
					);
					rows.push(tr);
				}
			}
			return (
				React.DOM.div(null,
					React.DOM.select({defaultValue: 'image', onChange: this.selection},
						React.DOM.option({value: 'image'}, 'Images'),
						React.DOM.option({value: 'music'}, 'Music'),
						React.DOM.option({value: 'sound'}, 'Sounds'),
						React.DOM.option({value: 'video'}, 'Videos'),
						React.DOM.option({value: 'blob'}, 'Blobs')
					),
					React.DOM.br(null),
					React.DOM.input({type: 'file', onChange: function (event) {
						var dir = '/Assets/';
						switch (self.state.type) {
						case 'image':
							dir += 'Graphics/';
							break;
						case 'sound':
						case 'music':
							dir += 'Sound/';
							break;
						case 'video':
							dir += 'Video/';
							break;
						}
						var value = event.target.value.replace(/\\/g, "/");
						var name = value.substr(value.lastIndexOf("/") + 1);
						copyFile(value, config.projectsDirectory() + "/" + self.props.repository + dir + name);
						var shortname = '';
						if (name.lastIndexOf('.') > 0) shortname = name.substring(0, name.lastIndexOf("."));
						else shortname = name;
						self.props.kha.assets.push({
							id: uuid.v4(),
							type: self.state.type,
							file: name,
							name: shortname
						});
						self.props.kha.save();
						self.forceUpdate();
					}}),
					React.DOM.div(null,
						React.DOM.table(null, React.DOM.tbody(null, rows))
					)
				)
			);
		}
	});
});

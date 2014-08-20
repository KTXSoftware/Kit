"use strict";

define(['../config.js', '../react.js'], function (config, React) {
	var fs = require("fs");
	var uuid = require("node-uuid");

	function remove(array, at) {
		var rest = array.slice(at + 1);
		array.length = at < 0 ? array.length + at : at;
		return array.push.apply(array, rest);
	}

	function copyFile(from, to) {
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
			var rows = [];
			for (var asset in this.props.kha.assets) {
				let current = this.props.kha.assets[asset];
				if (current.type === this.state.type) {
					var tr = React.DOM.tr(null,
						React.DOM.td(null,
							React.DOM.a({href: '#', onClick: function () { return false; }}, current.name)
						),
						React.DOM.td(null,
							React.DOM.button(null, '-')
						)
					);

					/*button.onclick = function() {
						for (var asset in assets) {
							if (assets[asset].type === type && assets[asset].name === current.name) {
								remove(assets, assets.indexOf(assets[asset]));
								kha.save();
								loadAssets(assets, type, element);
								return;
							}
						}
					};*/
					rows.push(tr);
				}
			}
			return (
				React.DOM.div(null,
					React.DOM.select({value: 'image', onChange: this.selection},
						React.DOM.option({value: 'image'}, 'Images'),
						React.DOM.option({value: 'music'}, 'Music'),
						React.DOM.option({value: 'sound'}, 'Sounds'),
						React.DOM.option({value: 'blob'}, 'Blobs')
					),
					React.DOM.br(null),
					React.DOM.input({type: 'file'}),
					React.DOM.div(null,
						React.DOM.table(null, React.DOM.tbody(null, rows))
					)
				)
			);
		}
	});

	/*
		button.onchange = function() {
			var dir = "/Assets/"
			switch (select.selectedIndex) {
			case 0:
				dir += "Graphics/";
				break;
			case 1:
			case 2:
				dir += "Sound/";
				break;
			}
			var value = button.value.replace(/\\/g, "/");
			var name = value.substr(value.lastIndexOf("/") + 1);
			copyFile(value, config.projectsDirectory() + "/" + repository + dir + name);
			var shortname = name.substring(0, name.lastIndexOf("."));
			var type = "image";
			switch (select.selectedIndex) {
			case 1:
				type = "music";
				break;
			case 2:
				type = "sound";
				break;
			case 3:
				type = "blob";
				break;
			}
			kha.assets.push( {
				id: uuid.v4(),
	      		type: type,
	      		file: name,
	      		name: shortname
			});
			kha.save();
			loadAssets(kha, kha.assets, type, div);
		};
	}*/
});

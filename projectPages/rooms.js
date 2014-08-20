"use strict";

define(['../react.js'], function (React) {
	var uuid = require("node-uuid");

	var roomsColumn;

	function findAsset(kha, assetId) {
		for (var asset in kha.assets) {
			if (kha.assets[asset].id === assetId) {
				return kha.assets[asset];
			}
		}
	}

	function contains(room, asset) {
		for (var assetId in room.assets) {
			if (asset.id === room.assets[assetId]) return true;
		}
		return false;
	}

	function arrayRemove(array, at) {
		var rest = array.slice(at + 1);
		array.length = at < 0 ? array.length + at : at;
		return array.push.apply(array, rest);
	}

	function remove(room, asset, table, line) {
		for (var assetId in room.assets) {
			if (asset.id === room.assets[assetId]) {
				arrayRemove(room.assets, room.assets.indexOf(room.assets[assetId]));
				return;
			}
		}
	}

	function addLine(kha, room, asset, rows) {
		let line = React.DOM.tr(null,
			React.DOM.td(null, asset.name),
			React.DOM.td(null, React.DOM.button(null, '-'))
		);
		rows.push(line);
		//button.onclick = function() {
		//	remove(room, asset, table, line);
		//	kha.save();
		//	loadRoom(kha, room);
		//};
	}

	function loadAssets(kha, room, type, title, rows) {
		var row = React.DOM.tr(null,
			React.DOM.td(null,
				React.DOM.h3(null, title)
			)
		);
		rows.push(row);

		var options = [];
		for (var asset in kha.assets) {
			if (kha.assets[asset].type === type && !contains(room, kha.assets[asset])) {
				var option = React.DOM.option({value: kha.assets[asset].id}, kha.assets[asset].name)
				options.push(option);
			}
		}
		row = React.DOM.tr(null,
			React.DOM.td(null,
				React.DOM.select(null, options)
			)
		);
		rows.push(row);

		//select.onfocus = function () {
		//	select.selectedIndex = -1;
		//};

		//select.onchange = function () {
		//	if (select.selectedIndex < 0) return;
		//	var value = select.options[select.selectedIndex].value;
		//	room.assets.push(value);
		//	kha.save();
		//	loadRoom(kha, room);
		//};
		
		for (var id in room.assets) {
			let asset = findAsset(kha, room.assets[id]);
			if (asset.type === type) {
				addLine(kha, room, asset, rows);
			}
		}
	}

	return React.createClass({displayName: 'RoomsPage',
		getInitialState: function () {
			return {room: null};
		},
		render: function () {
			var self = this;
			var rooms = [];
			if (this.props.kha !== undefined) {
				for (let room in this.props.kha.rooms) {
					rooms.push(React.DOM.br(null));
					rooms.push(React.DOM.a({href: '#', onClick: function () { self.setState({room: room}) }}, this.props.kha.rooms[room].name));
				}
			}

			var roomRows = [];
			if (this.state.room !== null) {
				loadAssets(this.props.kha, this.props.kha.rooms[this.state.room], "image", "Images", roomRows);
				loadAssets(this.props.kha, this.props.kha.rooms[this.state.room], "sound", "Sounds", roomRows);
				loadAssets(this.props.kha, this.props.kha.rooms[this.state.room], "music", "Music", roomRows);
				loadAssets(this.props.kha, this.props.kha.rooms[this.state.room], "blob", "Blobs", roomRows);
			}

			/*
			button.onclick = function() {
				let room = {
					id : uuid.v4(),
					name: input.value,
					parent: null,
					neighbours: [],
					assets: []
				};
				kha.rooms.push(room);
				kha.save();
			};
			*/
			return (
				React.DOM.table(null,
					React.DOM.tbody(null,
						React.DOM.tr(null,
							React.DOM.td({valign: 'top'},
								React.DOM.input(null),
								React.DOM.br(null),
								React.DOM.button(null, 'Add room'),
								rooms
							),
							React.DOM.td({valign: 'top'},
								React.DOM.table(null,
									React.DOM.tbody(null, roomRows)
								)
							)
						)
					)
				)
			);
		}
	});
});

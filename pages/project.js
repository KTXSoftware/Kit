define(['../config.js', '../react.js', '../projectPages/project.js', '../projectPages/assets.js', '../projectPages/rooms.js'], function (config, React, ProjectPage, AssetsPage, RoomsPage) {
	var fs = require('fs');
	return React.createClass({displayName: 'Project',
		getInitialState: function () {
			if (fs.existsSync(config.projectsDirectory() + "/" + this.props.name + "/project.kha")) {
				this.kha = JSON.parse(fs.readFileSync(config.projectsDirectory() + "/" + this.props.name + "/project.kha", {encoding: "utf8"}));
				var self = this;
				this.kha.save = function () {
					var string = JSON.stringify(self.kha, null, "\t");
					fs.writeFileSync(config.projectsDirectory() + "/" + self.props.name + "/project.kha", string, {encoding: "utf8"});
				};
			}
			return {page: 'Project'};
		},
		loadProject: function () {
			this.setState({page: 'Project'});
		},
		loadAssets: function () {
			this.setState({page: 'Assets'});
		},
		loadRooms: function () {
			this.setState({page: 'Rooms'});
		},
		render: function () {
			var page = null;
			switch (this.state.page) {
				case 'Project':
					page = ProjectPage({repository: this.props.name});
					break;
				case 'Assets':
					page = AssetsPage({repository: this.props.name, kha: this.kha});
					break;
				case 'Rooms':
					page = RoomsPage({kha: this.kha});
					break;
			}
			return (
				React.DOM.table(null,
					React.DOM.tbody(null,
						React.DOM.tr(null,
							React.DOM.td(null,
								React.DOM.button({onClick: this.loadProject}, this.props.name),
								React.DOM.button({onClick: this.loadAssets}, 'Assets'),
								React.DOM.button({onClick: this.loadRooms}, 'Rooms')
							)
						),
						React.DOM.tr(null,
							React.DOM.td(null, page)
						)
					)
				)
			);
		}
	});
});

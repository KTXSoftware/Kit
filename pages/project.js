define(['../config.js', '../react.js', '../projectPages/project.js', '../projectPages/assets.js'], function (config, React, ProjectPage, AssetsPage) {
	var fs = require('fs');
	//var roomsPage   = require("../projectPages/rooms.js");

	return React.createClass({displayName: 'Project',
		getInitialState: function () {
			if (fs.existsSync(config.projectsDirectory() + "/" + this.props.name + "/project.kha")) {
				this.kha = JSON.parse(fs.readFileSync(config.projectsDirectory() + "/" + this.props.name + "/project.kha", {encoding: "utf8"}));
				var self = this;
				this.kha.save = function () {
					var string = JSON.stringify(kha, null, "\t");
					fs.writeFileSync(config.projectsDirectory() + "/" + self.props.name + "/project.kha", string, {encoding: "utf8"});
				};
			}
			//roomsButton.onclick = function() {
			//	clear(td);
			//	roomsPage.load(repository, kha, td);
			//};
			return {page: 'Project'};
		},
		loadProject: function () {
			this.setState({page: 'Project'});
		},
		loadAssets: function () {
			this.setState({page: 'Assets'});
		},
		render: function () {
			var page = null;
			switch (this.state.page) {
				case 'Project':
					page = ProjectPage({repository: this.props.name});
					break;
				case 'Assets':
					page = AssetsPage({kha: this.kha});
					break;
			}
			return (
				React.DOM.table(null,
					React.DOM.tbody(null,
						React.DOM.tr(null,
							React.DOM.td(null,
								React.DOM.button({onClick: this.loadProject}, this.props.name),
								React.DOM.button({onClick: this.loadAssets}, 'Assets'),
								React.DOM.button(null, 'Rooms')
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

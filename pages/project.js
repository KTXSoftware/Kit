define(['../config.js', '../react.js', '../projectPages/project.js'], function (config, React, ProjectPage) {
	var fs = require('fs');
	//var projectPage = require("../projectPages/project.js");
	//var assetsPage  = require("../projectPages/assets.js");
	//var roomsPage   = require("../projectPages/rooms.js");

	return React.createClass({displayName: 'Project',
		getInitialState: function () {
			if (fs.existsSync(config.projectsDirectory() + "/" + this.props.name + "/project.kha")) {
				var kha = JSON.parse(fs.readFileSync(config.projectsDirectory() + "/" + this.props.name + "/project.kha", {encoding: "utf8"}));
				var self = this;
				kha.save = function () {
					var string = JSON.stringify(kha, null, "\t");
					fs.writeFileSync(config.projectsDirectory() + "/" + self.props.name + "/project.kha", string, {encoding: "utf8"});
				};
			}
			//projectButton.onclick = function() {
			//	clear(td);
			//	projectPage.load(repository, kha, td);
			//};
			//assetsButton.onclick = function() {
			//	clear(td);
			//	assetsPage.load(repository, kha, td);
			//};
			//roomsButton.onclick = function() {
			//	clear(td);
			//	roomsPage.load(repository, kha, td);
			//};
			//projectPage.load(repository, kha, td);
			return {page: 'Project'};
		},
		loadProject: function () {
			this.setState({page: 'Project'});
		},
		render: function () {
			var page = null;
			switch (this.state.page) {
				case 'Project':
					page = ProjectPage({repository: this.props.name});
					break;
			}
			return (
				React.DOM.table(null,
					React.DOM.tr(null,
						React.DOM.td(null,
							React.DOM.button({onClick: this.loadProject}, this.props.name),
							React.DOM.button(null, 'Assets'),
							React.DOM.button(null, 'Rooms')
						)
					),
					React.DOM.tr(null,
						React.DOM.td(null, page)
					)
				)
			);
		}
	});
});

"use strict";

requirejs(['domReady', './react.js', './log.js', './pages/log.js', './pages/config.js', './config.js', './pages/projects.js', './pages/project.js'], function (domReady, React, log, Log, Config, config, Projects, Project) {
	domReady(function () {
		log.info('Started Kit');

		var remote = require('remote');
		var app = remote.require('app');
		config.init(app.getPath('userData'));

		var Kit = React.createClass({displayName: 'Kit',
			getInitialState: function () {
				if (config.projectsDirectory() === '') return {page: 'Config'};
				else return {page: 'Projects'};
			},
			reload: function () {
				remote.getCurrentWindow().restart();
			},
			loadDevtools: function () {
				remote.getCurrentWindow().toggleDevTools();
			},
			loadLog: function () {
				document.getElementById('logButton').className = '';
				this.setState({page: 'Log'});
			},
			loadConfig: function () {
				this.setState({page: 'Config'});
			},
			loadProjects: function () {
				this.setState({page: 'Projects'});
			},
			loadProject: function (name) {
				this.setState({page: 'Project', projectName: name});
			},
			render: function () {
				var self = this;
				var page = null;
				switch (this.state.page) {
					case 'Log':
						page = Log();
						break;
					case 'Config':
						page = Config();
						break;
					case 'Projects':
						page = Projects({loadProject: function (name) { self.loadProject(name); }});
						break;
					case 'Project':
						page = Project({name: this.state.projectName});
						break;
				}
				return (
					React.DOM.div({className: 'kit'},
						React.DOM.div({className: 'top'},
							React.DOM.div({className: 'topmenu'},
								React.DOM.div({className: 'topmenu2'},
									React.DOM.div({className: 'topleft'},
										React.DOM.button({onClick: this.loadProjects}, 'Projects')
									),
									React.DOM.div({className: 'topright'},
										React.DOM.input({checked: config.hideUnavailable(), type: 'checkbox', onChange: function () { config.setHideUnavailable(!config.hideUnavailable()); self.forceUpdate(); }}),
										React.DOM.span({onClick: function () { config.setHideUnavailable(!config.hideUnavailable()); self.forceUpdate(); }}, ' Hide unavailable projects '),
										React.DOM.button({onClick: this.loadConfig}, 'Config'),
										React.DOM.button({id: 'logButton', onClick: this.loadLog}, 'Log'),
										React.DOM.button({onClick: this.reload}, '\u21bb'),
										React.DOM.button({onClick: this.loadDevtools}, '*')
									)
								)
							)
						),
						React.DOM.div({className: 'center'},
							React.DOM.div({className: 'content'}, page)
						),
						React.DOM.div({className: 'bottom'},
							React.DOM.div({style: {align: 'center'}, id: 'kittinfo'})
						),
						React.DOM.div({id: 'kitt', className: 'kitt', style: {position: 'fixed'}}, '\u00a0')
					)
				);
			}
		});
		React.renderComponent(Kit(), document.body);
	});
});

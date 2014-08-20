"use strict";

requirejs(['domReady', './react.js', './log.js', './pages/log.js', './pages/config.js', './config.js', './pages/projects.js', './git.js'], function (domReady, React, log, Log, Config, config, Projects, git) {
	domReady(function () {
		log.info('Started Kit');

		var gui = require('nw.gui');
		config.init(gui.App.dataPath);
		git.init(document.getElementById('kittinfo'), process, gui.App.dataPath);

		var Kit = React.createClass({displayName: 'Kit',
			getInitialState: function () {
				if (config.projectsDirectory() === null) return {page: 'Config'};
				else return {page: 'Projects'};
			},
			reload: function () {
				gui.Window.get().reload(3);
			},
			loadDevtools: function () {
				gui.Window.get().showDevTools();
			},
			loadLog: function () {
				this.setState({page: 'Log'});
			},
			loadConfig: function () {
				this.setState({page: 'Config'});
			},
			loadProjects: function () {
				this.setState({page: 'Projects'});
			},
			render: function () {
				var self = this;
				var page = null;
				switch (this.state.page) {
					case 'Empty':
						page = Empty();
						break;
					case 'Log':
						page = Log();
						break;
					case 'Config':
						page = Config();
						break;
					case 'Projects':
						page = Projects();
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
										React.DOM.input({checked: config.hideUnavailable(), type: 'checkbox', onClick: function (event) { config.setHideUnavailable(event.target.checked); self.forceUpdate(); }}),
										React.DOM.span(null, ' Hide unavailable projects '),
										React.DOM.button({onClick: this.loadConfig}, 'Config'),
										React.DOM.button({onClick: this.loadLog}, 'Log'),
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

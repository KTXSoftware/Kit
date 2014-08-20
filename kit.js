"use strict";

requirejs(['domReady', './react.js', './log.js', './pages/log.js', './pages/config.js', './config.js', './pages/projects.js'], function (domReady, React, log, Log, Config, config, Projects) {
	domReady(function () {
		/*
		var log    = require("./log.js");
		var logButton = document.getElementById('logButton');
		log.init(logButton);
		var config = require("./config.js");
		var projectsPage = require("./pages/projects.js");
		var configPage   = require("./pages/config.js");
		var logPage      = require("./pages/log.js");
		logPage.init(logButton);

		config.init(gui.App.dataPath);
		if (config.projectsDirectory() === null) configPage.load();
		else projectsPage.load();
		document.getElementById("projectsButton").onclick = projectsPage.load;
		document.getElementById("configButton").onclick = configPage.load;
		logButton.onclick = logPage.load;
		var hidespan = document.getElementById('hideunavailable');
		var hidebox = document.getElementById('hideunavailablebox');
		if (config.hideUnavailable()) hidebox.click();
		hidespan.onclick = function () {
			hidebox.click();
		};
		hidebox.onclick = function () {
			config.setHideUnavailable(hidebox.checked);
			projectsPage.redraw();
		};
		require('./git.js').init(document.getElementById('kittinfo'), process, gui.App.dataPath);
		*/

		log.info('Started Kit');

		var gui = require('nw.gui');
		config.init(gui.App.dataPath);

		var Empty = React.createClass({displayName: 'Empty',
			render: function () {
				return React.DOM.div(null);
			}
		});

		var Kit = React.createClass({displayName: 'Kit',
			getInitialState: function () {
				return {page: 'Empty'};
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
										React.DOM.input({type: 'checkbox', id: 'hideunavailablebox'}),
										React.DOM.span({id: 'hideunavailable'}, ' Hide unavailable projects '),
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

define(['../log.js', '../react.js', '../config.js'], function (log, React, config) {
	return React.createClass({displayName: 'Config',
		projectsDir: function (event) {
			var self = this;
			var remote = require('remote');
			var dialog = remote.require('dialog');
			dialog.showOpenDialog(remote.getCurrentWindow(), { title: 'Projects Directory', properties: ['openDirectory']}, function (directories) {
				if (directories.length > 0) {
					config.setProjectsDirectory(directories[0]);
					self.refs.dirbutton.getDOMNode().textContent = directories[0];
				}
			});
		},
		mp3: function (event) {
			config.setMP3Encoder(event.target.value);
		},
		aac: function (event) {
			config.setAACEncoder(event.target.value);
		},
		visualStudio: function (event) {
			config.setVisualStudio(event.target.value);
		},
		graphics: function (event) {
			config.setWindowsGraphics(event.target.value);
		},
		render: function () {
			return (
				React.DOM.table(null,
					React.DOM.tr(null,
						React.DOM.td(null, 'Projects directory'),
						React.DOM.td(null, React.DOM.button({ref: 'dirbutton', onClick: this.projectsDir}, config.projectsDirectory() === '' ? 'Choose a directory' : config.projectsDirectory()))
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'MP3 encoder'),
						React.DOM.td(null, React.DOM.input({defaultValue: config.mp3Encoder(), onChange: this.mp3}))
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'AAC encoder'),
						React.DOM.td(null, React.DOM.input({defaultValue: config.aacEncoder(), onChange: this.aac}))
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'Visual Studio'),
						React.DOM.td(null, 
							React.DOM.select({defaultValue: config.visualStudio(), onChange: this.visualStudio},
								React.DOM.option({value: 'vs2010'}, '2010'),
								React.DOM.option({value: 'vs2012'}, '2012'),
								React.DOM.option({value: 'vs2013'}, '2013')
							)
						)
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'Windows Graphics'),
						React.DOM.td(null,
							React.DOM.select({defaultValue: config.windowsGraphics(), onChange: this.graphics},
								React.DOM.option({value: 'direct3d9'}, 'Direct3D 9'),
								React.DOM.option({value: 'direct3d11'}, 'Direct3D 11'),
								React.DOM.option({value: 'opengl2'}, 'OpenGL')
							)
						)
					)
				)
			);
			//table.appendChild(createRow2(document.createTextNode("Android Devkit"), document.createTextNode("_")));
			//table.appendChild(createRow2(document.createTextNode("Precompiled Headers"), document.createTextNode("_")));
			//table.appendChild(createRow2(document.createTextNode("Intermediate Drive"), document.createTextNode("_")));
		}
	});
});

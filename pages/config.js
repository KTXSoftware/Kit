define(['../log.js', '../react.js', '../config.js'], function (log, React, config) {
	return React.createClass({displayName: 'Config',
		projectsDir: function () {
			config.setProjectsDirectory(this.value);
		},
		mp3: function () {
			config.setMP3Encoder(this.value);
		},
		aac: function () {
			config.setAACEncoder(this.value);
		},
		git: function () {
			config.setGit(this.value);
		},
		render: function () {
			return (
				React.DOM.table(null,
					React.DOM.tr(null,
						React.DOM.td(null, 'Projects directory'),
						React.DOM.td(null, React.DOM.input({type: 'file', nwdirectory: 'nwdirectory', onChange: this.projectsDir}))
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'MP3 encoder'),
						React.DOM.td(null, React.DOM.input({value: config.mp3Encoder(), onChange: this.mp3}))
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'AAC encoder'),
						React.DOM.td(null, React.DOM.input({value: config.aacEncoder(), onChange: this.aac}))
					),
					React.DOM.tr(null,
						React.DOM.td(null, 'Git command'),
						React.DOM.td(null, React.DOM.input({value: config.git(), onChange: this.git}))
					)
				)
			);
			//table.appendChild(createRow2(document.createTextNode("Android Devkit"), document.createTextNode("_")));
			//table.appendChild(createRow2(document.createTextNode("Visual Studio"), document.createTextNode("_")));
			//table.appendChild(createRow2(document.createTextNode("Windows Graphics"), document.createTextNode("_")));
			//table.appendChild(createRow2(document.createTextNode("Precompiled Headers"), document.createTextNode("_")));
			//table.appendChild(createRow2(document.createTextNode("Intermediate Drive"), document.createTextNode("_")));
		}
	});
});

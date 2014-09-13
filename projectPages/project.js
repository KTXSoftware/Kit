define(['../react.js', '../config.js', '../log.js'], function (React, config, log) {
	var cp = require("child_process");
	var fs = require('fs');
	var os = require("os");

	function open(file) {
		if (os.platform() === 'linux') { }
		else if (os.platform() === 'win32') {
			cp.spawn('cmd', ['/c', 'start', '""', file]);
		}
		else {
			cp.spawn('open', [file]);
		}
	}

	var currentServer = null;

	function startServer(dir) {
		var nstatic = require('node-static');
		var file = new nstatic.Server(dir);
		currentServer = require('http').createServer(function (request, response) {
			request.addListener('end', function () {
				file.serve(request, response);
			}).resume();
		});
		currentServer.listen(8080);
	}

	var exe = "hake-osx";
	if (os.platform() === "linux") {
		exe = "hake-linux";
	}
	else if (os.platform() === "win32") {
		exe = "hake.exe";
	}

	function create(system, repository, callback) {
		var make = null;
		try {
			make = require(config.projectsDirectory() + '/' + repository + '/Kha/Tools/khamake/main.js');
		}
		catch (e) {

		}
		if (make === null) {
			try {
				make = require(config.projectsDirectory() + '/' + repository + '/Kore/Tools/koremake/main.js');
			}
			catch (e) {

			}
		}
		if (make === null) {
			try {
				make = require(config.projectsDirectory() + '/' + repository + '/Kt/Tools/koremake/main.js');
			}
			catch (e) {

			}
		}
		if (make !== null && make.api !== undefined && make.api >= 1) {
			make.run({
				from: config.projectsDirectory() + '/' + repository,
				to: config.projectsDirectory() + '/' + repository + '/build',
				platform: system,
				haxe: '',
				ogg: '',
				aac: config.aacEncoder(),
				mp3: config.mp3Encoder(),
				h264: '', 
				webm: '',
				wmv: '',
				kfx: '',
				khafolders: true,
				embedflashassets: false,
				graphicsApi: config.windowsGraphics(),
				visualStudioVersion: config.visualStudio()
			}, log, callback);
		}
		else {
			var child = cp.spawn(config.projectsDirectory() + "/" + repository + "/Kha/Tools/hake/" + exe,
				[system, "mp3=" + config.mp3Encoder(), "aac=" + config.aacEncoder(), 'gfx=' + config.windowsGraphics(), 'vs=' + config.visualStudio()],
				{ cwd: config.projectsDirectory() + "/" + repository});

			child.stdout.on('data', function (data) {
				log.info(data);
			});

			child.stderr.on('data', function (data) {
				log.info(data);
			});

			child.on('error', function (err) {
				log.error('Hake error');
				//callback();
			});

			child.on('close', callback);
		}
	}

	return React.createClass({displayName: 'ProjectPage',
		getInitialState: function () {
			this.system = 'flash';
			return null;
		},
		create: function () {
			create(this.system, this.props.repository, function () { });
		},
		launch: function () {
			var self = this;
			create(this.system, this.props.repository, function () {
				open(config.projectsDirectory() + '/' + self.props.repository + '/build/project-' + self.system + '.hxproj');

				var projectName = config.projectsDirectory();
				if (fs.existsSync(config.projectsDirectory() + '/' + self.props.repository + '/project.kha')) {
					var kha = JSON.parse(fs.readFileSync(config.projectsDirectory() + '/' + self.props.repository + '/project.kha', {encoding: 'utf8'}));
					projectName = kha.game.name;
				}

				switch (self.system) {
				case 'html5':
					if (currentServer !== null) {
						currentServer.close(function () {
							startServer(config.projectsDirectory() + '/' + self.props.repository + '/build/html5/');
						});
					}
					else {
						startServer(config.projectsDirectory() + '/' + self.props.repository + '/build/html5/');
					}
					break;
				case 'windows':
				case 'windowsrt':
					var projectFile = config.projectsDirectory() + '/' + self.props.repository + '/build/' + projectName + '.sln';
					if (!fs.existsSync(projectFile)) projectFile = config.projectsDirectory() + '/' + self.props.repository + '/build/' + self.system + '-build/' + projectName + '.sln';
					open(projectFile);
					break;
				case 'osx':
				case 'ios':
					var projectFile = config.projectsDirectory() + '/' + self.props.repository + '/build/' + projectName + '.xcodeproj';
					if (!fs.existsSync(projectFile)) projectFile = config.projectsDirectory() + '/' + self.props.repository + '/build/' + self.system + '-build/' + projectName + '.xcodeproj';
					open(projectFile);
					break;
				case 'wpf':
				case 'xna':
					open(config.projectsDirectory() + '/' + self.props.repository + '/build/' + self.system + '-build/Project.sln');
					break;
				}
			});
		},
		selection: function (event) {
			this.system = event.target.value;
		},
		render: function () {
			return (
				React.DOM.div(null,
					React.DOM.select({defaultValue: 'flash', onChange: this.selection},
						React.DOM.option({value: 'flash'}, 'Flash'),
						React.DOM.option({value: 'html5'}, 'HTML5'),
						React.DOM.option({value: 'windows'}, 'Windows'),
						React.DOM.option({value: 'osx'}, 'OSX'),
						React.DOM.option({value: 'linux'}, 'Linux'),
						React.DOM.option({value: 'ios'}, 'iOS'),
						React.DOM.option({value: 'android'}, 'Android'),
						React.DOM.option({value: 'windowsrt'}, 'WindowsRT'),
						React.DOM.option({value: 'tizen'}, 'Tizen'),
						React.DOM.option({value: 'psm'}, 'PlayStationMobile'),
						React.DOM.option({value: 'xna'}, 'XNA'),
						React.DOM.option({value: 'dalvik'}, 'Dalvik'),
						React.DOM.option({value: 'wpf'}, 'WPF'),
						React.DOM.option({value: 'java'}, 'Java')
					),
					React.DOM.button({onClick: this.create}, 'Create'),
					React.DOM.button({onClick: this.launch}, 'Launch IDE')
				)
			);
		}
	});
});

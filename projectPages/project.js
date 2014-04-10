var cp = require("child_process");
var fs = require('fs');
var os = require("os");
var config = require("../config.js");

var document = window.document;

function addOption(select, value) {
	var option = document.createElement("option");
	option.appendChild(document.createTextNode(value));
	select.appendChild(option);
}

function getSystem(select) {
	switch (select.selectedIndex) {
	case 0:
		return "flash";
	case 1:
		return "html5";
	case 2:
		return "windows";
	case 3:
		return "osx";
	case 4:
		return "linux";
	case 5:
		return "ios";
	case 6:
		return "android";
	case 7:
		return "windowsrt";
	case 8:
		return "tizen";
	case 9:
		return "psm";
	case 10:
		return "xna";
	case 11:
		return "dalvik";
	case 12:
		return "wpf";
	case 13:
		return "java";
	}
}

function open(file) {
	if (os.platform() === 'linux') { }
	else if (os.platform() === 'win32') {
		cp.spawn('cmd', ['/c', 'start', '""', file]);
	}
	else {
		cp.spawn('open', [file]);
	}
}

exports.load = function(repository, kha, element) {
	var select = document.createElement("select");
	addOption(select, "Flash");
	addOption(select, "HTML5");
	addOption(select, "Windows");
	addOption(select, "OSX");
	addOption(select, "Linux");
	addOption(select, "iOS");
	addOption(select, "Android");
	addOption(select, "WindowsRT");
	addOption(select, "Tizen");
	addOption(select, "PlayStationMobile");
	addOption(select, "XNA");
	addOption(select, "Dalvik");
	addOption(select, "WPF");
	addOption(select, "Java");
	element.appendChild(select);

	var button = document.createElement("button");
	button.appendChild(document.createTextNode("Create"));
	element.appendChild(button);

	var exe = "hake-osx";
	if (os.platform() === "linux") {
		exe = "hake-linux";
	}
	else if (os.platform() === "win32") {
		exe = "hake.exe";
	}

	function create(callback) {
		var child = cp.spawn(config.projectsDirectory() + "/" + repository + "/Kha/Tools/hake/" + exe,
			[getSystem(select), "mp3=" + config.mp3Encoder(), "aac=" + config.aacEncoder()],
			{ cwd: config.projectsDirectory() + "/" + repository});
		child.on('close', callback);
	}

	button.onclick = function () {
		create(function () { });
	};

	var launchButton = document.createElement('button');
	launchButton.appendChild(document.createTextNode('Launch IDE'));
	element.appendChild(launchButton);

	launchButton.onclick = function () {
		create(function () {
			open(config.projectsDirectory() + '/' + repository + '/build/project-' + getSystem(select) + '.hxproj');

			var projectName = config.projectsDirectory();
			if (fs.existsSync(config.projectsDirectory() + '/' + repository + '/project.kha')) {
				var kha = JSON.parse(fs.readFileSync(config.projectsDirectory() + '/' + repository + '/project.kha', {encoding: 'utf8'}));
				projectName = kha.game.name;
			}

			switch (getSystem(select)) {
			case 'windows':
			case 'windowsrt':
				var projectFile = config.projectsDirectory() + '/' + repository + '/build/' + projectName + '.sln';
				if (!fs.existsSync(projectFile)) projectFile = config.projectsDirectory() + '/' + repository + '/build/' + getSystem(select) + '-build/' + projectName + '.sln';
				open(projectFile);
				break;
			case 'osx':
			case 'ios':
				var projectFile = config.projectsDirectory() + '/' + repository + '/build/' + projectName + '.xcodeproj';
				if (!fs.existsSync(projectFile)) projectFile = config.projectsDirectory() + '/' + repository + '/build/' + getSystem(select) + '-build' + projectName + '.xcodeproj';
				open(projectFile);
				break;
			case 'wpf':
			case 'xna':
				open(config.projectsDirectory() + '/' + repository + '/build/' + getSystem(select) + '-build/Project.sln');
				break;
			}
		});
	};
}

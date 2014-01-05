var cp = require("child_process");
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

	/*var button = document.createElement("button");
	button.appendChild(document.createTextNode("Compile Assets"));
	element.appendChild(button);

	button = document.createElement("button");
	button.appendChild(document.createTextNode("Launch Project"));
	element.appendChild(button);*/

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

	button.onclick = function() {
		cp.spawn(config.projectsDirectory() + "/" + repository + "/Kha/Tools/hake/" + exe,
		[getSystem(select), "mp3=" + config.mp3Encoder(), "aac=" + config.aacEncoder()],
		{
			cwd: config.projectsDirectory() + "/" + repository
		});
	};
}

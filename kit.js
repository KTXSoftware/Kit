"use strict";

window.onload = function() {
	var gui = require('nw.gui');
	document.getElementById('reloadButton').onclick = function () {
		gui.Window.get().reload(3);
	};
	document.getElementById('devButton').onclick = function () {
		gui.Window.get().showDevTools();
	};

	var log    = require("./log.js");
	var config = require("./config.js");
	var projectsPage = require("./pages/projects.js");
	var configPage   = require("./pages/config.js");
	var logPage      = require("./pages/log.js");

	config.init(gui.App.dataPath);
	if (config.projectsDirectory() === null) configPage.load();
	else projectsPage.load();
	document.getElementById("projectsButton").onclick = projectsPage.load;
	document.getElementById("configButton").onclick = configPage.load;
	document.getElementById("logButton").onclick = logPage.load;
	var hidebox = document.getElementById('hideunavailable');
	if (config.hideUnavailable()) hidebox.click();
	hidebox.onclick = function () {
		config.setHideUnavailable(hidebox.checked);
		projectsPage.redraw();
	};
	require('./git.js').init(document.getElementById('kittinfo'), process, gui.App.dataPath);
}

"use strict";

var log    = require("./log.js");
var config = require("./config.js");
var projectsPage = require("./pages/projects.js");
var configPage   = require("./pages/config.js");
var logPage      = require("./pages/log.js");

window.onload = function() {
	if (config.projectsDirectory() === null) configPage.load();
	else projectsPage.load();
	document.getElementById("projectsButton").onclick = projectsPage.load;
	document.getElementById("configButton").onclick = configPage.load;
	document.getElementById("logButton").onclick = logPage.load;
	document.getElementById('reloadButton').onclick = function () {
		require('nw.gui').Window.get().reload(3);
	};
	document.getElementById('devButton').onclick = function () {
		require('nw.gui').Window.get().showDevTools();
	};
	require('./git.js').init(document.getElementById('kittinfo'));
}

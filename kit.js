"use strict";

var log    = require("./log.js");
var config = require("./config.js");
var projectsPage = require("./pages/projects.js");
var configPage   = require("./pages/config.js");
var logPage      = require("./pages/log.js");

window.onload = function() {
	log.info("Starting up.");
	if (config.username() === null) configPage.load();
	else projectsPage.load();
	document.getElementById("projectsButton").onclick = projectsPage.load;
	document.getElementById("configButton").onclick = configPage.load;
	document.getElementById("logButton").onclick = logPage.load;
}

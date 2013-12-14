"use strict";

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.contains = function(substring) {
	return this.indexOf(substring) !== -1;
};

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

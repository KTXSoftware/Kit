"use strict";

var spawn = require('child_process').spawn;

exports.update = function(project, baseurl, projectsDir, callback) {
	var process = spawn('git', ['clone', '--depth', '50', baseurl + project, projectsDir + project]);

	process.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	process.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});

	process.on('close', function (code) {
		var process = spawn('git', ['submodule', 'update', '--depth', '50', '--init', '--recursive'], {cwd: projectsDir + project});
		process.on('close', function (code) {
			callback();
		});
	});
}

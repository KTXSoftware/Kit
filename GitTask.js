define(function () {
	function kittMessage(data) {
		var lastReturn = 0;
		var lastGoodReturn = 0;
		for (var i = 0; i < data.length; ++i) {
			if (data[i] == 0xa || data[i] == 0xd) {
				lastReturn = i;
			}
			if (data[i] > 0x20) {
				lastGoodReturn = lastReturn;
			}
		}
		data = data.slice(lastGoodReturn);
		document.getElementById('kittinfo').innerHTML = data;
	}

	function spawnGit(parameters, dir, callback) {
		var params = '';
		for (var p in parameters) params += ' ' + parameters[p];

		log.info('Calling kitgit' + params + ' in ' + dir);

		var env = myProcess.env;
		var process = spawn('kitgit', parameters, {cwd: dir, env: env});
		process.stdin.setEncoding('utf8');
		var std = '';

		process.stdout.on('data', function (data) {
			std += data;
			log.info(data);
		});

		process.stderr.on('data', function (data) {
			kittMessage(data);
		});

		process.on('error', function (err) {
			log.error('Could not call git with parameters' + params + ' in ' + dir);
			callback(1, std);
		});

		process.on('close', function (code) {
			if (code !== 0) {
				log.error('Git reported error with parameters' + params + ' in ' + dir);
				callback(code, std);
			}
			else {
				callback(code, std);
			}
		});
	}

	var exports = {};

	exports.execute = function (parameters, callback) {
		spawnGit([], parameters.projectsDir + parameters.repo.name, function (code, std) {
			callback();
		});
	};

	return exports;
});

define(function () {
	var busy = false;
	var tasks = [];

	function executeNextTask() {
		if (tasks.length > 0) {
			busy = true;
			tasks.pop().execute(executeNextTask);
		}
		else {
			busy = false;
		}
	}

	var exports = {};

	exports.add = function (task) {
		tasks.push(task);
		if (!busy) {
			executeNextTask();
		}
	};

	return exports;
});

define(function () {
	var busy = false;
	var tasks = [];

	function executeNextTask() {
		if (tasks.length > 0) {
			busy = true;
			var task = tasks.pop();
			task.task.execute(task.parameters, executeNextTask);
		}
		else {
			busy = false;
		}
	}

	var exports = {};

	exports.add = function (task, parameters) {
		tasks.push({task: task, parameters: parameters});
		if (!busy) {
			executeNextTask();
		}
	};

	return exports;
});

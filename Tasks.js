"use strict";

define(function () {
	var busy = false;
	var tasks = [];

	var kittcount = 0;
	var kittanimated = false;

	function animate() {
		var kitt = document.getElementById('kitt');
		if (!kitt) return;

		++kittcount;
		var kittx = (Math.sin(kittcount / 100) + 1) / 2 * (window.innerWidth - 100);

		if (kitt !== null) {
			kitt.style.top = window.innerHeight - 20 + 'px';
			kitt.style.left = kittx + 'px';
		}
		if (kittanimated) window.requestAnimationFrame(animate);
	}

	function setVisible() {
		let kitt = document.getElementById('kitt');
		if (kitt) {
			kitt.style.visibility = 'visible';
		}
	}

	function setInvisible() {
		let kitt = document.getElementById('kitt');
		if (kitt) {
			kitt.style.visibility = 'hidden';
		}
	}

	function resetText() {
		let info = document.getElementById('kittinfo');
		if (info) {
			info.innerHTML = '';
		}
	}

	function executeNextTask() {
		if (tasks.length > 0) {
			busy = true;

			setVisible();
			kittanimated = true;
			animate();

			var task = tasks.pop();
			task.task.execute(task.parameters, executeNextTask);
		}
		else {
			busy = false;
			resetText();
			setInvisible();
			kittanimated = false;
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

"use strict";

define(['../git.js', '../log.js', '../config.js', '../react.js', './project.js', '../ProjectsListTask.js', '../GitTask.js', '../Tasks.js'], function (git, log, config, React, Project, ProjectsListTask, GitTask, Tasks) {
	var os = require("os");
	var fs = require("fs");
	var http = require("http");
	var https = require("https");

	var document = window.document;

	function remove(array, at) {
		var rest = array.slice(at + 1);
		array.length = at < 0 ? array.length + at : at;
		return array.push.apply(array, rest);
	}

	function Button(text) {
		this.element = document.createElement("button");
		this.element.appendChild(document.createTextNode(text));
	}

	function contains(array, value) {
		for (var v in array) {
			if (array[v] === value) return true;
		}
		return false;
	}

	/*exports.load = function() {
		page.clear();
		table = document.createElement("table");
		var content = document.getElementById("content");
		content.appendChild(table);

		var tr = document.createElement("tr");
		var td = document.createElement("td");
		var input = document.createElement("input");
		td.appendChild(input);
		tr.appendChild(td);
		td = document.createElement("td");
		var button = document.createElement("button");
		button.appendChild(document.createTextNode("Create project"));
		td.appendChild(button);
		tr.appendChild(td);
		//table.appendChild(tr);

		button.onclick = function() {
			fs.mkdirSync(config.projectsDirectory() + "/" + input.value);

			fs.writeFileSync(
				config.projectsDirectory() + "/" + input.value + "/.gitignore",
				"/build\n/kake.lua\n"
			);
			
			fs.writeFileSync(
				config.projectsDirectory() + "/" + input.value + "/project.kha",
				JSON.stringify({ format: 1, game: { name: input.value, width: 640, height: 480}, assets: [], rooms: []}, null, "\t")
			);
			
			fs.mkdirSync(config.projectsDirectory() + "/" + input.value + "/Sources");
				
			fs.writeFileSync(
				config.projectsDirectory() + "/" + input.value + "/Sources/Main.hx",
				"package;\n\n"
				+ "import kha.Starter;\n\n"
				+ "class Main {\n"
				+ "\tpublic static function main() {\n"
				+ "\t\tnew Starter().start(new " + input.value + "());\n"
				+ "\t}\n"
				+ "}"
			);	
			
			fs.writeFileSync(
				config.projectsDirectory() + "/" + input.value + "/Sources/" + input.value + ".hx",
				"package;\n\n"
				+ "import kha.Game;\n\n"
				+ "class " + input.value + " extends Game {\n"
				+ "\tpublic function new() {\n"
				+ "\t\tsuper(\"" + input.value + "\", false);"
				+ "\t}"
				+ "}"
			);
			
			fs.writeFileSync(
				config.projectsDirectory() + "/" + input.value + "/.gitmodules",
				'[submodule "Kha"]\n\tpath = Kha\n\turl = ../Kha\n\tbranch = master'
			);
		};

		loadRepositories();
	};*/

	var kittcount = 0;
	var kittanimated = false;

	function animate() {
		var kitt = document.getElementById('kitt');

		++kittcount;
		var kittx = (Math.sin(kittcount / 100) + 1) / 2 * (window.innerWidth - 100);

		if (kitt !== null) {
			kitt.style.top = window.innerHeight - 20 + 'px';
			kitt.style.left = kittx + 'px';
		}
		if (kittanimated) window.requestAnimationFrame(animate);
	}

	return React.createClass({displayName: 'Projects',
		getInitialState: function() {
			var self = this;
			//loadRepositories(function (repos) { loading = false; if (self.isMounted()) self.redraw(repos); });
			ProjectsListTask.addChangeCallbacks(function (repos) {
				if (self.isMounted()) self.redraw(repos);
			});
			Tasks.add(ProjectsListTask, {});
			return {repos: []};
		},
		redraw: function (repos) {
			this.setState({repos: repos});
		},
		render: function () {
			var self = this;
			let lines = [];
			for (let r in this.state.repos) {
				let project = this.state.repos[r];

				if (!project.available && config.hideUnavailable()) continue;

				var tr = React.DOM.tr(null,
					React.DOM.td(null, project.name),
					React.DOM.td(null, React.DOM.button({onClick: function () {
						document.getElementById('kitt').style.visibility = 'visible';
						kittanimated = true;
						animate();
						Tasks.add(GitTask, {repo: project, projectsDir: config.projectsDirectory() + '/'});
						/*git.update(project, projects, config.projectsDirectory() + "/",
							function() {
								document.getElementById('kitt').style.visibility = 'hidden';
								kittanimated = false;
								if (self.isMounted()) self.forceUpdate();
							}
						);*/
					}}, project.available ? 'Update' : 'Download')),
					React.DOM.td(null, React.DOM.button({disabled: !project.available, onClick: function () { self.props.loadProject(project.name); }}, 'Open'))
				);
				lines.push(tr);
			}
			if (this.state.repos.length === 0) {
				return React.DOM.table({width: '100%', height: '100%'}, React.DOM.tbody(null, React.DOM.tr(null, React.DOM.td({style: {'text-align': 'center'}}, React.DOM.img({src: 'pac.gif'})))));
			}
			else {
				return React.DOM.table(null, React.DOM.tbody(null, lines));
			}
		}
	});
});

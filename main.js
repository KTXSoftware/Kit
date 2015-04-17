var app = require('app');
var BrowserWindow = require('browser-window');

//require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
	//if (process.platform != 'darwin') {
		app.quit();
	//}
});

app.on('ready', function() {
	app.commandLine.appendSwitch('js-flags', '--harmony');
	mainWindow = new BrowserWindow({width: 1024, height: 768});
	mainWindow.toggleDevTools();
	mainWindow.loadUrl('file://' + __dirname + '/index.html');
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
});

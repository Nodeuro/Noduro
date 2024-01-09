const {app, shell, BrowserWindow, ipcMain, nativeTheme, dialog, Notification, nativeImage} = require('electron');
const path = require('path');
if (require('electron-squirrel-startup')) app.quit();

const fs = require('fs');
const keytar = require('keytar');
const sqlite3 = require('sqlite3').verbose();








app.setName('Noduro');
async function authWindow(authType) {
	shell.openExternal('https://auth.noduro.org/' + authType);
	const express = require('express');
	const app = express();
	const cors = require('cors');

	app.use(express.json());
	app.use(cors());

	const loginPromise = new Promise((resolve, reject) => {
		app.post('/login', (req, res) => {
			const {token, uid} = req.body;
			console.log(token + 'uid ' + uid);
			resolve({token, uid});
		});
	});

	app.listen(3000, () => {
		console.log('Server listening on port 3000');
	});

	const loginInfo = await loginPromise;
	return loginInfo;
}

const iconPath = {
	darwin: './assets/icons/icon.icns',
	win32: './assets/icons/icon.ico',
	linux: '/.assets/icons/icon.png',
};

let mainWindow;
if (process.defaultApp) {
	if (process.argv.length >= 2) {
		app.setAsDefaultProtocolClient('noduro', process.execPath, [path.resolve(process.argv[1])]);
	}
} else {
	app.setAsDefaultProtocolClient('noduro');
}

function systemThemeCommunicator() {
	ipcMain.handle('dark-mode:toggle', () => {
		if (nativeTheme.shouldUseDarkColors) {
			nativeTheme.themeSource = 'light';
		} else {
			nativeTheme.themeSource = 'dark';
		}
		return nativeTheme.shouldUseDarkColors;
	});
	ipcMain.handle('dark-mode:light', () => {
		nativeTheme.themeSource = 'light';
	});
	ipcMain.handle('dark-mode:dark', () => {
		nativeTheme.themeSource = 'dark';
	});
	ipcMain.handle('dark-mode:system', () => {
		nativeTheme.themeSource = 'system';
	});
	ipcMain.handle('dark-mode:check', () => {
		return nativeTheme.shouldUseDarkColors;
	});
}

//The window
const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nativeWindowOpen: true,
			nodeIntegration: true,
			webviewTag:true,
			enableRemoteModule: false, // Disable remote module
			devTools: !app.isPackaged // Disable dev tools if app is packaged (production)

		},
		zoomToPageWidth: true,
		show: false,
		backgroundColor: '#2e2c29',
		icon: iconPath[process.platform],
		title: 'Noduro',
	});
	mainWindow.maximize();
	mainWindow.once('ready-to-show', () => {
		if (process.env.NODE_ENV !== 'production') {
			mainWindow.webContents.openDevTools({mode: 'detach'});
		}
		mainWindow.show();
	});
	systemThemeCommunicator();
	mainWindow.loadFile('pages/home/index.html');

	
	ipcMain.handle('noduro:folder_picker', async (event) => {
		const result = await dialog.showOpenDialog(mainWindow, {
			properties: ['openDirectory'],
		});
		if (!result.canceled) {
			return result.filePaths[0];
		} else {
			return null;
		}
	});
	ipcMain.handle('noduro:display_notification', async (event, title, message) => {
		new Notification({
			title: title,
			body: message,
		}).show();
	});
};

//activate the app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
		dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().slice(0, -1)}`);
	});
	app.whenReady().then(() => {
		const platform = process.platform;
		if (platform === 'darwin') {
			var icon_img = iconPath.darwin;
			app.dock.setIcon(nativeImage.createFromPath(icon_img));
		} else if (platform === 'win32') var icon_img = iconPath.win32;
		else if (platform === 'linux') var icon_img = iconPath.linux;
		createWindow();

		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
	});
}
app.on('before-quit', () => {
	db.close((err) => {
		if (err) {
			console.error('Error closing database:', err);
		} else {
			console.log('Database closed successfully');
		}
	});
});
//Some end case stuff
app.on('open-url', (event, url) => {
	dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`);
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

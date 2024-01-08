const {contextBridge, ipcRenderer, shell} = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('darkMode', {
	toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
	system: () => ipcRenderer.invoke('dark-mode:system'),
	dark: () => ipcRenderer.invoke('dark-mode:dark'),
	light: () => ipcRenderer.invoke('dark-mode:light'),
	checkDark: () => ipcRenderer.invoke('dark-mode:check'),
});

const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('networkAPI', {
  getCurrentNetwork: () => ipcRenderer.invoke('get-current-network'),
  enableEthernet: (serviceName) => ipcRenderer.invoke('enable-ethernet', serviceName),
  disableEthernet: (serviceName) => ipcRenderer.invoke('disable-ethernet', serviceName),
  getNetworkServices: () => ipcRenderer.invoke('get-network-services')
});
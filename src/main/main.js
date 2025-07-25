import { app, BrowserWindow, ipcMain, Tray, Menu, nativeTheme } from 'electron';
import path from 'node:path';
import { exec } from 'node:child_process';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let tray = null;
let mainWindow = null;
let trayNetworkStatus = '未知';
let trayServices = [];
let trayCurrentService = '';

function getTrayIcon() {
  const isDark = nativeTheme.shouldUseDarkColors;
  const iconName = isDark ? 'tray-icon-light-32x32.png' : 'tray-icon-dark-32x32.png';
  return path.join(__dirname, '../../public', iconName);
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, '../../public/app-icon-128x128.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('close', (event) => {
    // 最小化到托盘而不是退出
    event.preventDefault();
    mainWindow.hide();
  });
};

async function updateTrayMenu() {
  // 获取当前网络状态
  let statusLabel = '未知';
  let isConnected = false;
  let currentService = '';
  let currentInterface = '';
  try {
    const result = await getCurrentNetwork();
    if (result.success) {
      isConnected = !!(result.serviceName && result.interface);
      currentService = result.serviceName;
      currentInterface = result.interface;
      statusLabel = isConnected ? `已连接: ${currentService} (${currentInterface})` : '未连接';
      trayCurrentService = currentService;
    } else {
      statusLabel = '获取状态失败';
    }
  } catch {
    statusLabel = '获取状态失败';
  }

  // 获取所有服务
  try {
    const servicesResult = await getNetworkServices();
    if (servicesResult.success) {
      trayServices = servicesResult.services;
    } else {
      trayServices = [];
    }
  } catch {
    trayServices = [];
  }

  // 构建托盘菜单
  const serviceSubmenu = trayServices.length > 0 ? trayServices.map(service => ({
    label: service + (service === trayCurrentService ? ' (当前)' : ''),
    enabled: service !== trayCurrentService,
    click: async () => {
      trayCurrentService = service;
      await updateTrayMenu();
    }
  })) : [{ label: '无可用服务', enabled: false }];

  const contextMenu = Menu.buildFromTemplate([
    { label: `网络状态: ${statusLabel}`, enabled: false },
    { type: 'separator' },
    { label: '刷新网络状态', click: async () => { await updateTrayMenu(); } },
    { label: '选择网络服务', submenu: serviceSubmenu },
    { label: '启用以太网', enabled: !!trayCurrentService, click: async () => {
        if (trayCurrentService) {
          await enableEthernet(trayCurrentService);
          await updateTrayMenu();
        }
      }
    },
    { label: '禁用以太网', enabled: !!trayCurrentService, click: async () => {
        if (trayCurrentService) {
          await disableEthernet(trayCurrentService);
          await updateTrayMenu();
        }
      }
    },
    { type: 'separator' },
    { label: '显示主窗口', click: () => { if (mainWindow) mainWindow.show(); } },
    { label: '退出', click: () => { app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
}

// 直接调用主进程的网络操作函数
async function getCurrentNetwork() {
  try {
    const primaryInterface = await executeCommand("route get default 2>/dev/null | awk '/interface: / {print $2}'");
    const serviceName = await executeCommand(`networksetup -listnetworkserviceorder | grep -B1 "Device: ${primaryInterface.trim()}" | head -n1 | sed 's/.*) //'`);
    return {
      success: true,
      interface: primaryInterface.trim(),
      serviceName: serviceName.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.error || 'Unknown error'
    };
  }
}

async function getNetworkServices() {
  try {
    const output = await executeCommand('networksetup -listallnetworkservices');
    const services = output.split('\n')
      .filter(line => line.trim() && !line.includes('*') && !line.includes('An asterisk'))
      .map(line => line.trim());
    return { success: true, services };
  } catch (error) {
    return {
      success: false,
      error: error.error || 'Failed to get network services'
    };
  }
}

async function enableEthernet(serviceName) {
  try {
    await executeCommand(`networksetup -setnetworkserviceenabled "${serviceName}" on`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.error || 'Failed to enable ethernet' };
  }
}

async function disableEthernet(serviceName) {
  try {
    await executeCommand(`networksetup -setnetworkserviceenabled "${serviceName}" off`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.error || 'Failed to disable ethernet' };
  }
}

function createTray() {
  if (tray) return;
  tray = new Tray(getTrayIcon());
  tray.setToolTip('Network Manager');
  updateTrayMenu();
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
  // 监听系统主题变化，自动切换托盘图标
  nativeTheme.on('updated', () => {
    tray.setImage(getTrayIcon());
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createTray();
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../../public/app-icon-128x128.png'));
  }
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 执行shell命令的辅助函数
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

// IPC处理程序
ipcMain.handle('get-current-network', async () => {
  try {
    const primaryInterface = await executeCommand("route get default 2>/dev/null | awk '/interface: / {print $2}'");
    const serviceName = await executeCommand(`networksetup -listnetworkserviceorder | grep -B1 "Device: ${primaryInterface.trim()}" | head -n1 | sed 's/.*) //'`);
    
    return {
      success: true,
      interface: primaryInterface.trim(),
      serviceName: serviceName.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.error || 'Unknown error'
    };
  }
});

ipcMain.handle('enable-ethernet', async (event, serviceName) => {
  try {
    await executeCommand(`networksetup -setnetworkserviceenabled "${serviceName}" on`);
    // 等待网络状态更新
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.error || 'Failed to enable ethernet'
    };
  }
});

ipcMain.handle('disable-ethernet', async (event, serviceName) => {
  try {
    await executeCommand(`networksetup -setnetworkserviceenabled "${serviceName}" off`);
    // 等待网络状态更新
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.error || 'Failed to disable ethernet'
    };
  }
});

ipcMain.handle('get-network-services', async () => {
  try {
    const output = await executeCommand('networksetup -listallnetworkservices');
    const services = output.split('\n')
      .filter(line => line.trim() && !line.includes('*') && !line.includes('An asterisk'))
      .map(line => line.trim());
    return { success: true, services };
  } catch (error) {
    return {
      success: false,
      error: error.error || 'Failed to get network services'
    };
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

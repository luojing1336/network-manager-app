const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    resizable: false
  });

  mainWindow.loadFile('index.html');

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 开发时打开开发者工具
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// 应用准备就绪
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
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
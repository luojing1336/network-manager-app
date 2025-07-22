import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { exec } from 'node:child_process';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

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

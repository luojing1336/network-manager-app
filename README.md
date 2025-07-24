# Mac网络管理工具 (network-manager-app)

> 基于 Electron + Vite 构建的 Mac 网络管理桌面应用，支持一键查看、启用和禁用以太网（有线网络），并附带命令行脚本。

---

## 功能特性

- 查看当前 Mac 使用的网络服务和接口
- 一键启用/禁用指定的以太网服务
- 自动检测和列出所有网络服务
- 托盘图标支持亮/暗主题自动切换
- macOS Dock 图标自定义
- 操作日志与状态提示
- 附带 Bash 脚本，支持命令行管理网络

---

## 截图

> ![界面截图](screenshot.png)  
> *（请自行添加截图）*

---

## 安装与运行

### 1. 克隆项目

```bash
git clone https://github.com/yourname/network-manager-app.git
cd network-manager-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动应用

```bash
npm start
```

应用会以桌面窗口形式启动，并在系统托盘显示图标。

---

## 构建与打包

- 打包应用：`npm run package`
- 生成安装包：`npm run make`

### 图标说明

- **主窗口图标**：`public/app-icon-64x64.png`
- **托盘图标**：自动根据系统主题切换 `public/tray-icon-light-32x32.png` 和 `public/tray-icon-dark-32x32.png`
- **Dock 图标（macOS）**：`public/app-icon-512x512.png`
- **应用打包图标**：推荐使用 `.icns`（macOS）或 `.ico`（Windows），可用最大尺寸 PNG 转换

---

## 目录结构

```
.
├── src/
│   ├── main/                # Electron 主进程
│   │   └── main.js
│   ├── renderer/            # 渲染进程（前端逻辑与资源）
│   │   ├── renderer.js
│   │   └── styles.css
│   ├── preload/             # 预加载脚本
│   │   └── preload.js
├── public/                  # 应用图标与静态资源
│   ├── app-icon-*.png
│   ├── tray-icon-*.png
│   └── ...
├── scripts/
│   └── network-manager.sh   # Bash 脚本，命令行网络管理
├── index.html
├── package.json
├── forge.config.js
└── ...
```

---

## 使用说明

### 图形界面

- 启动后自动显示当前网络状态
- 下拉选择网络服务（如“USB 10/100/1000 LAN”）
- 点击“启用以太网”或“禁用以太网”按钮进行操作
- 日志区显示每次操作结果
- 关闭主窗口时最小化到托盘，双击托盘图标可还原

### 命令行脚本

`scripts/network-manager.sh`  
支持以下功能：

1. 查看当前使用的网络
2. 启用有线网络
3. 禁用有线网络
4. 退出

> **注意：**  
> 默认以太网服务名称为 `USB 10/100/1000 LAN`，如有不同请修改脚本顶部的 `ETHERNET_SERVICE` 变量。

运行方法：

```bash
bash scripts/network-manager.sh
```

---

## 图标与打包说明

- **托盘图标**：`public/tray-icon-light-32x32.png`、`public/tray-icon-dark-32x32.png`，自动适配亮/暗主题
- **Dock 图标**：`public/app-icon-512x512.png`，在 `main.js` 通过 `app.dock.setIcon` 设置
- **应用打包图标**：在 `forge.config.js` 的 `packagerConfig.icon` 字段指定（推荐 `.icns` 或 `.ico`，可用 PNG 转换）

---

## 依赖

- [Electron](https://www.electronjs.org/) 37.x
- [Vite](https://vitejs.dev/) 5.x
- [Electron Forge](https://www.electronforge.io/)

---

## 开发与贡献

欢迎提交 issue 和 PR！

---

## License

MIT
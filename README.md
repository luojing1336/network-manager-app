# Mac网络管理工具 (network-manager-app)

> 基于 Electron + Vite 构建的 Mac 网络管理桌面应用，支持一键查看、启用和禁用以太网（有线网络），并附带命令行脚本。

## 功能特性

- 查看当前 Mac 使用的网络服务和接口
- 一键启用/禁用指定的以太网服务
- 自动检测和列出所有网络服务
- 操作日志与状态提示
- 附带 Bash 脚本，支持命令行管理网络

## 截图

> ![界面截图](screenshot.png)  
> *（请自行添加截图）*

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

应用会以桌面窗口形式启动。

## 构建与打包

- 打包应用：`npm run package`
- 生成安装包：`npm run make`

## 目录结构

```
.
├── src/                      # 主程序源码
│   ├── main/                 # Electron 主进程相关
│   │   └── main.js           # 主进程入口
│   ├── renderer/             # 渲染进程（前端逻辑与资源）
│   │   ├── renderer.js       # 渲染进程入口
│   │   ├── styles.css        # 样式文件
│   ├── preload/              # 预加载脚本
│   │   └── preload.js        # 预加载入口
│   ├── assets/               # 静态资源（如图片）
│   │   └── lj-logo.png       # 应用 logo
├── scripts/
│   └── network-manager.sh    # Bash 脚本，命令行网络管理
├── index.html                # 应用主页面
├── package.json              # 项目信息与依赖
├── forge.config.js           # Electron Forge 配置
└── ...                       # 其他配置文件
```

## 使用说明

### 图形界面

- 启动后自动显示当前网络状态
- 下拉选择网络服务（如“USB 10/100/1000 LAN”）
- 点击“启用以太网”或“禁用以太网”按钮进行操作
- 日志区显示每次操作结果

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

## 依赖

- [Electron](https://www.electronjs.org/) 37.x
- [Vite](https://vitejs.dev/) 5.x
- [Electron Forge](https://www.electronforge.io/)

## 开发与贡献

欢迎提交 issue 和 PR！

## License

MIT
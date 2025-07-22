# Mac网络管理工具

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![许可证](https://img.shields.io/badge/许可证-MIT-green)

一个简单易用的Mac网络管理桌面应用，帮助您快速启用或禁用网络接口，特别适合需要频繁切换网络连接的用户。

<p align="center">
  <img src="https://via.placeholder.com/700x400?text=Mac网络管理工具截图" alt="应用截图" width="700">
</p>

## ✨ 功能特点

- 🔍 实时显示当前网络状态和活跃接口
- 🔌 一键启用/禁用以太网连接
- 📋 支持多网络服务选择和管理
- 📝 操作日志记录，方便追踪网络变更
- 🖥️ 美观的用户界面，符合macOS设计风格
- 🔒 无需管理员权限即可操作（首次使用可能需要授权）

## 🚀 安装方法

### 下载安装包

1. 从[Releases](https://github.com/luojing1336/network-manager-app/releases)页面下载最新的DMG安装包
2. 打开DMG文件并将应用拖到Applications文件夹
3. 首次运行时，可能需要在「系统偏好设置 > 安全性与隐私」中允许应用运行

### 从源码构建

如果您想从源码构建应用，请按照以下步骤操作：

```bash
# 克隆仓库
git clone https://github.com/luojing1336/network-manager-app.git
cd network-manager-app

# 安装依赖
npm install

# 启动开发环境
npm run dev

# 构建应用
npm run build-mac
```

构建完成后，您可以在`dist`目录中找到应用安装包。

## 💻 使用方法

1. 启动应用后，它会自动检测当前网络状态
2. 从下拉菜单中选择您想要管理的网络服务（默认会尝试选择USB以太网）
3. 点击「启用以太网」或「禁用以太网」按钮来控制所选网络服务
4. 操作日志会记录所有网络变更，方便您追踪历史操作

## 🔧 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- HTML/CSS/JavaScript - 前端界面
- Node.js - 后端逻辑
- macOS网络命令行工具 - 网络管理功能

## 📝 注意事项

- 本应用仅支持macOS系统
- 某些网络操作可能需要管理员权限
- 建议在使用前备份重要的网络配置

## 🤝 贡献

欢迎提交问题和功能请求！如果您想贡献代码，请遵循以下步骤：

1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 📞 联系方式

作者: luojing1336 - luojing1336@hotmail.com

项目链接: [https://github.com/luojing1336/network-manager-app](https://github.com/luojing1336/network-manager-app)
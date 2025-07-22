#!/bin/bash

# ========== 配置 ==========
# 修改为你自己的有线网络服务名称（可以用 networksetup -listallnetworkservices 查看）
ETHERNET_SERVICE="USB 10/100/1000 LAN"

# ========== 函数定义 ==========
function show_current_network() {
    primary_service=$(route get default 2>/dev/null | awk '/interface: / {print $2}')
    service_name=$(networksetup -listnetworkserviceorder | \
        grep -B1 "Device: $primary_service" | \
        head -n1 | sed 's/.*) //')

    echo ""
    echo "Current network service: $service_name (interface: $primary_service)"
    # echo "当前使用的网络服务是: $service_name（接口: $primary_service）"
    echo ""
}

function enable_ethernet() {
    echo ""
    echo "🔌 Enabling Ethernet: $ETHERNET_SERVICE"
    networksetup -setnetworkserviceenabled "$ETHERNET_SERVICE" on
    sleep 2  # 等待网络状态更新
    echo "✅ Ethernet enabled."

    show_current_network  # 🔄 显示当前使用的网络
}

function disable_ethernet() {
    echo ""
    echo "🔌 Disabling Ethernet: $ETHERNET_SERVICE"
    networksetup -setnetworkserviceenabled "$ETHERNET_SERVICE" off
    sleep 2  # 等待网络状态更新
    echo "✅ Ethernet disabled."

    show_current_network  # 🔄 显示当前使用的网络
}

# ========== 菜单 ==========
while true; do
    echo "============== Mac 网络管理工具 =============="
    echo "1) 查看当前使用的网络"
    echo "2) 启用有线网络 ($ETHERNET_SERVICE)"
    echo "3) 禁用有线网络 ($ETHERNET_SERVICE)"
    echo "4) 退出"
    echo "=============================================="
    read -rp "请输入选项 (1-4): " choice

    case $choice in
        1)
            show_current_network
            ;;
        2)
            enable_ethernet
            ;;
        3)
            disable_ethernet
            ;;
        4)
            echo "👋 退出程序，再见！"
            exit 0
            ;;
        *)
            echo "❌ 无效的选项，请输入 1-4 之间的数字"
            ;;
    esac
done

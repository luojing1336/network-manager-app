// DOM元素
const currentStatus = document.getElementById('currentStatus');
const serviceSelect = document.getElementById('serviceSelect');
const enableBtn = document.getElementById('enableBtn');
const disableBtn = document.getElementById('disableBtn');
const refreshBtn = document.getElementById('refreshBtn');
const logContainer = document.getElementById('logContainer');
const clearLogBtn = document.getElementById('clearLogBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// 应用状态
let currentSelectedService = '';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    refreshBtn.addEventListener('click', refreshNetworkStatus);
    enableBtn.addEventListener('click', enableEthernet);
    disableBtn.addEventListener('click', disableEthernet);
    clearLogBtn.addEventListener('click', clearLog);
    
    serviceSelect.addEventListener('change', (e) => {
        currentSelectedService = e.target.value;
        updateButtonStates();
    });
}

// 初始化应用
async function initializeApp() {
    await loadNetworkServices();
    await refreshNetworkStatus();
    logMessage('应用初始化完成', 'info');
}

// 加载网络服务列表
async function loadNetworkServices() {
    try {
        const result = await window.networkAPI.getNetworkServices();
        
        if (result.success) {
            serviceSelect.innerHTML = '<option value="">请选择网络服务</option>';
            
            result.services.forEach(service => {
                const option = document.createElement('option');
                option.value = service;
                option.textContent = service;
                serviceSelect.appendChild(option);
            });
            
            // 尝试选择USB以太网服务
            const usbEthernet = result.services.find(service => 
                service.includes('USB') && service.includes('LAN')
            );
            
            if (usbEthernet) {
                serviceSelect.value = usbEthernet;
                currentSelectedService = usbEthernet;
                updateButtonStates();
            }
            
            logMessage('网络服务列表已加载', 'success');
        } else {
            logMessage(`加载网络服务失败: ${result.error}`, 'error');
            serviceSelect.innerHTML = '<option value="">加载失败</option>';
        }
    } catch (error) {
        logMessage(`加载网络服务时发生错误: ${error.message}`, 'error');
    }
}

// 刷新网络状态
async function refreshNetworkStatus() {
    showLoading();
    
    try {
        const result = await window.networkAPI.getCurrentNetwork();
        
        if (result.success) {
            updateNetworkStatus(result);
            logMessage('网络状态已更新', 'success');
        } else {
            showNetworkError(result.error);
            logMessage(`获取网络状态失败: ${result.error}`, 'error');
        }
    } catch (error) {
        showNetworkError(error.message);
        logMessage(`获取网络状态时发生错误: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// 更新网络状态显示
function updateNetworkStatus(networkInfo) {
    const isConnected = networkInfo.serviceName && networkInfo.interface;
    
    currentStatus.className = `status-info ${isConnected ? 'connected' : 'disconnected'}`;
    
    if (isConnected) {
        currentStatus.innerHTML = `
            <div class="network-details">
                <div class="network-detail">
                    <span class="detail-label">🌐 当前服务:</span>
                    <span class="detail-value">${networkInfo.serviceName}</span>
                </div>
                <div class="network-detail">
                    <span class="detail-label">📡 网络接口:</span>
                    <span class="detail-value">${networkInfo.interface}</span>
                </div>
                <div class="network-detail">
                    <span class="detail-label">📊 连接状态:</span>
                    <span class="detail-value" style="background: #d4edda; color: #155724;">已连接</span>
                </div>
            </div>
        `;
    } else {
        currentStatus.innerHTML = `
            <div class="network-details">
                <div class="network-detail">
                    <span class="detail-label">📊 连接状态:</span>
                    <span class="detail-value" style="background: #f8d7da; color: #721c24;">未连接</span>
                </div>
                <div style="margin-top: 12px; color: #6c757d; font-style: italic;">
                    没有检测到活跃的网络连接
                </div>
            </div>
        `;
    }
}

// 显示网络错误
function showNetworkError(error) {
    currentStatus.className = 'status-info disconnected';
    currentStatus.innerHTML = `
        <div style="text-align: center;">
            <p style="color: #721c24; font-weight: 600; margin-bottom: 8px;">❌ 获取网络信息失败</p>
            <p style="color: #6c757d; font-size: 0.9em;">${error}</p>
        </div>
    `;
}

// 启用以太网
async function enableEthernet() {
    if (!currentSelectedService) {
        logMessage('请先选择网络服务', 'error');
        return;
    }
    
    showLoading();
    logMessage(`正在启用以太网: ${currentSelectedService}`, 'info');
    
    try {
        const result = await window.networkAPI.enableEthernet(currentSelectedService);
        
        if (result.success) {
            logMessage(`✅ 以太网已启用: ${currentSelectedService}`, 'success');
            await refreshNetworkStatus();
        } else {
            logMessage(`❌ 启用以太网失败: ${result.error}`, 'error');
        }
    } catch (error) {
        logMessage(`❌ 启用以太网时发生错误: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// 禁用以太网
async function disableEthernet() {
    if (!currentSelectedService) {
        logMessage('请先选择网络服务', 'error');
        return;
    }
    
    showLoading();
    logMessage(`正在禁用以太网: ${currentSelectedService}`, 'info');
    
    try {
        const result = await window.networkAPI.disableEthernet(currentSelectedService);
        
        if (result.success) {
            logMessage(`✅ 以太网已禁用: ${currentSelectedService}`, 'success');
            await refreshNetworkStatus();
        } else {
            logMessage(`❌ 禁用以太网失败: ${result.error}`, 'error');
        }
    } catch (error) {
        logMessage(`❌ 禁用以太网时发生错误: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// 更新按钮状态
function updateButtonStates() {
    const hasService = currentSelectedService !== '';
    enableBtn.disabled = !hasService;
    disableBtn.disabled = !hasService;
}

// 记录日志
function logMessage(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    logEntry.innerHTML = `
        <span class="log-timestamp">${timestamp}</span>
        <span>${message}</span>
    `;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // 限制日志条数，避免占用过多内存
    if (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

// 清空日志
function clearLog() {
    logContainer.innerHTML = '<div class="log-entry info">日志已清空</div>';
}

// 显示加载遮罩
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

// 隐藏加载遮罩
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// 错误处理
window.addEventListener('error', (e) => {
    logMessage(`应用错误: ${e.error.message}`, 'error');
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (e) => {
    logMessage(`未处理的错误: ${e.reason}`, 'error');
    e.preventDefault();
});
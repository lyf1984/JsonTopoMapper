/**
 * 主入口模块 - 文件处理与网络初始化
 * 功能：处理Electron文件打开事件，构建网络拓扑结构
 */

// 导入核心模块
import { addNodeWithChildren, addEdge,calculateVulnerability } from './handlers/dataHandlers.js';
import { getNetworkOptions } from './config/networkConfig.js';
import { setupNetworkEvents } from './handlers/eventHandlers.js';
import { appState } from './utils/state.js';

/* ====================== Electron文件事件处理 ====================== */
// 监听文件打开事件（由Electron主进程触发）
window.api.onFilePath(async (filePath) => {
  try {
    /* ---------------------- 文件读取与解析 ---------------------- */
    // 异步读取文件内容
    const content = await window.api.readFile(filePath);
    console.log("文件路径:", filePath);
    // 解析JSON数据结构
    const data = JSON.parse(content);
    /* ---------------------- 销毁旧的网络实例 ---------------------- */
    // 销毁旧网络实例（如果存在）
    if (appState.network) {
      appState.network.destroy(); // 释放资源
      appState.network.off();
      appState.network = null;
    }
    /* ---------------------- 数据初始化 ---------------------- */
    // 清空现有数据
    appState.nodes.clear();
    appState.edges.clear();
    appState.ipToId.clear();
    // 重置ID计数器
    appState.idCounter = 1;  // TODO: 需要与appState中的ID生成机制保持一致
    // // 调试点1：验证原始数据
    // console.log('原始节点数:', data.nodes.length);
    // console.log('原始边数:', data.edges.length);
    /* ---------------------- 节点处理 ---------------------- */
    // 递归创建所有节点及子节点
    data.nodes.forEach(node => addNodeWithChildren(node, data, null));

    /* ---------------------- 边处理 ---------------------- */
    // 添加及处理所有边
    data.edges.forEach(edge => addEdge(edge, data));
    // // 调试点2：验证处理后数据
    // console.log('处理后节点数:', appState.nodes.length);
    // console.log('处理后边数:', appState.edges.length);
    // console.log('IP映射表大小:', appState.ipToId.size);
    /* ---------------------- 网络可视化初始化 ---------------------- */
    // DOM 容器重置
    const container = document.getElementById('mynetwork');
    // 创建vis.js网络实例
    appState.network = new vis.Network(
      container,
      {
        nodes: appState.nodes,
        edges: appState.edges
      },
      getNetworkOptions()  // 获取预定义的网络配置
    );
    /* ---------------------- 事件监听设置 ---------------------- */
    // 初始化网络交互事件
    setupNetworkEvents(filePath);
    
    // 执行脆弱性分析
    // calculateVulnerability();

  } catch (error) {
    console.error('文件处理流程失败:', error);
    // TODO: 添加用户可见的错误提示（如弹窗通知）
  }
});
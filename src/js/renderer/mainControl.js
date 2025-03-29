import { addNodeWithChildren, handleEdgeNode } from './handlers/dataHandlers.js';
import { getNetworkOptions,EDGE_LENGTH_MAIN } from './config/networkConfig.js';
import { setupNetworkEvents } from './handlers/eventHandlers.js';
import { appState } from './utils/state.js';


// Electron文件打开事件
window.api.onFilePath(async (filePath) => {
  try {
    // ...文件读取逻辑...
    const content = await window.api.readFile(filePath);
    console.log("filepath:", filePath);
    const data = JSON.parse(content);
    appState.nodes.clear();
    appState.edges.clear();
    let idCounter = 1; // 重置ID计数器
    // 使用模块化函数
    data.nodes.forEach(node =>
      addNodeWithChildren(node, data)
    );
    data.edges.forEach(edge => {
      const fromId = handleEdgeNode(edge.from_node, data);
      const toId = handleEdgeNode(edge.to_node, data);
      appState.edges.add({
        from: fromId,
        to: toId,
        length: EDGE_LENGTH_MAIN,
        edge_type: edge.edge_type,
        protocol: edge.protocol,
        layer: edge.layer,
        color: 'black',
        dashes: !appState.ipToId[edge.from_node] || !appState.ipToId[edge.to_node] // 虚线表示包含自动创建的节点
      });

    });
    var container = document.getElementById('mynetwork');  // 网络图容器
    // 初始化网络
    appState.network = new vis.Network(container, {
      nodes: appState.nodes,
      edges: appState.edges
    }, getNetworkOptions());

    // 设置事件监听
    setupNetworkEvents(filePath);
  } catch (error) {
    console.error('文件处理失败:', error);
  }
});
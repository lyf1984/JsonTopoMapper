import { appState } from '../utils/state.js';
import { EDGE_LENGTH_MAIN } from '../config/networkConfig.js';
// 递归添加节点
export const addNodeWithChildren = (node, data, parentId = null) => {
    // ...原有addNodeWithChildren实现...
    // 注意将nodes/edges作为参数传入
    // 生成当前节点ID并存储映射
    const currentNodeId = appState.incrementId();
    appState.nodes.add({
        id: currentNodeId,
        label: node.node_id,
        node_type: node.node_type,
        state: node.state,
        fqdn: node.fqdn,
        reverse_dns: node.reverse_dns,
        mac_address: node.mac_address,
        vendor: node.vendor,
        open_ports: node.open_ports,
        os: node.os,
        children: node.children,
        shape: "circle",
        color: {
            background: "#F0E68C",
            border: "#B8860B",
            highlight: {
                background: "#FFD700",
                border: "#DAA520",
            },
            hover: {
                background: "#FFD700",
                border: "#8B7500",
            },
        },
        shadow: {
            enabled: true,
            color: "rgba(0, 0, 0, 0.5)",
            size: 10,
            x: 5,
            y: 5,
        },
        opacity: 1
        // title: generateNodeTile(node),
    });
    appState.ipToId[node.node_id] = currentNodeId;

    // 连接到父节点
    if (parentId !== null) {
        edges.add({
            from: parentId,
            to: currentNodeId,
            length: EDGE_LENGTH_MAIN,
            color: '#808080'
        });
    }

    // 递归处理子节点
    if (node.node_type === 'subnet' && node.children) {
        node.children.forEach(childId => {
            // 在数据中查找对应的子节点对象
            const childNode = data.nodes.find(n => n.node_id === childId);
            if (childNode) {
                // 如果找到子节点定义，递归处理
                addNodeWithChildren(childNode, data, currentNodeId);
            } else {
                // 未找到时创建占位节点
                console.warn(`子节点 ${childId} 未定义，创建占位节点`);
                addNodeWithChildren({
                    node_id: childId,
                    node_type: 'unknown',
                    state: 'down'
                }, data, currentNodeId);
            }
        });
    }
};

// 处理边节点
export const handleEdgeNode = (nodeId) => {
    // ...原有handleEdgeNode实现...
    // 注意将nodes/edges作为参数传入

    if (!appState.ipToId[nodeId]) {
        // 尝试在原始数据中查找节点定义
        const originalNode = data.nodes.find(n => n.node_id === nodeId);
        if (originalNode) {
            // 如果找到未处理的节点，完整添加
            addNodeWithChildren(originalNode, data, nodeId);
            return appState.ipToId[nodeId];
        } else {
            // 创建自动生成的节点
            const newId = appState.incrementId();
            appState.nodes.add({
                id: newId,
                label: nodeId,
                node_type: 'auto',
                shape: "circle",
                color: {
                    background: "#E0FFFF",
                    border: "#4682B4",
                    highlight: { background: "#AFEEEE", border: "#5F9EA0" },
                    hover: { background: "#AFEEEE", border: "#5F9EA0" }
                },
                title: `自动生成节点: ${nodeId}`
            });
            appState.ipToId[nodeId] = newId;
            return newId;
        }
    }
    return appState.ipToId[nodeId];
};
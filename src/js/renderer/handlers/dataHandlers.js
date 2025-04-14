/**
 * 网络节点处理模块
 * 功能：实现网络节点的递归创建、子节点处理及边缘节点处理逻辑
 */

// 导入依赖
import { appState } from '../utils/state.js';
import { EDGE_LENGTH_MAIN } from '../config/networkConfig.js';

/* ======================== 核心节点处理函数 ======================== */

/**
 * 递归创建节点及其子节点结构
 * @param {Object} node - 当前节点数据对象
 * @param {Object} data - 完整数据集（包含所有节点定义）
 * @param {number|null} parentId - 父节点ID（顶层节点为null）
 * @returns {void}
 */
export const addNodeWithChildren = (node, data, parentId) => {
    var currentNodeId;
    //是否已创建
    if (!appState.ipToId.has(node.node_id)) {
        // 生成当前节点唯一ID并维护IP映射关系
        currentNodeId = appState.incrementId();
        // 创建当前节点对象
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
            parent: node.parent,
            // 可视化样式配置
            shape: "dot",
            font: {
                face: 'Arial',
                size: 14,
                color: 'rgba(232, 159, 159, 0.9)',
                strokeWidth: 2,
                strokeColor: 'rgba(0,0,0,0.7)'
              },
            color: node.node_type === "subnet" ?
                {
                    // 子网专用颜色（蓝色系）
                    background: "#87CEEB",
                    border: "#4682B4",
                    highlight: { background: "#B0E0E6", border: "#5F9EA0" },
                    hover: { background: "#B0E0E6", border: "#4682B4" }
                }
                :
                {
                    // 默认颜色（黄色系）
                    background: "#F0E68C",
                    border: "#B8860B",
                    highlight: { background: "#FFD700", border: "#DAA520" },
                    hover: { background: "#FFD700", border: "#8B7500" }
                },
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.3)',
                size: 8,
                x: 2,
                y: 2
            },
            opacity: 1
        });
        appState.ipToId.set(node.node_id, currentNodeId);
    }

    currentNodeId = appState.ipToId.get(node.node_id);
    /* ---------------------- 父子节点连接处理 ---------------------- */
    if (parentId !== null) {
        appState.edges.add({
            from: parentId,
            to: currentNodeId,
            length: EDGE_LENGTH_MAIN, // 使用预定义的主干边长度
            color: '#808080',
            dashes: true
        });
    }

    /* ---------------------- 子节点递归处理 ---------------------- */
    if (node.node_type === 'subnet' && node.children) {
        node.children.forEach(childId => {
            // 在数据集中查找子节点定义
            const childNode = data.nodes.find(n => n.node_id === childId);
            if (childNode) {
                // 递归创建有效子节点
                addNodeWithChildren(childNode, data, currentNodeId);

                // 获取子节点在 appState.nodes 中的实际 id
                const childNodeActualId = appState.ipToId.get(childNode.node_id);
                if (childNodeActualId) {
                    const childNodeObj = appState.nodes.get(childNodeActualId);
                    if (childNodeObj && !childNodeObj.parent) {
                        childNodeObj.parent = currentNodeId;
                        // 更新节点数据
                        appState.nodes.update(childNodeObj);
                    }
                }
            } else {
                // 创建占位节点处理数据缺失情况
                console.warn(`子节点 ${childId} 未定义，创建占位节点`);
                addNodeWithChildren({
                    node_id: childId,
                    node_type: 'unknown',
                    state: 'down',
                    parent: currentNodeId
                }, data, currentNodeId);
            }
        });
    }
};
/* ======================== 脆弱性分析算法 ======================== */
/**
 * 计算网络脆弱性（基于端口数）
 */
export const calculateVulnerability = () => {
    const connectionThreshold = 3; // 连接数阈值

    appState.nodes.forEach(node => {
        const portCount = node.open_ports ? node.open_ports.length : 0;
        node.vulnerable = portCount > 5;

        if (node.vulnerable) {
            // 存储原始颜色
            const originalColor = { ...node.color };
            const blinkColor = {
                background: '#FF6B6B',
                border: '#CC0000',
                highlight: { background: '#FF9999', border: '#FF4444' }
            };
            let isBlinking = false;
            // 每 500ms 切换一次颜色

            node.color = isBlinking ? originalColor : blinkColor;
            appState.nodes.update(node);

        }
    });
};

/* ======================== 边处理函数 ======================== */
export const addEdge = (edge, data) => {
    const fromId = handleEdgeNode(edge.from_node, data);
    const toId = handleEdgeNode(edge.to_node, data);

    // 检查边是否已经存在
    const existingEdge = appState.edges.get({
        filter: (e) => e.from === fromId && e.to === toId
    });

    if (existingEdge.length === 0) {
        // 创建边对象
        appState.edges.add({
            from: fromId,
            to: toId,
            length: EDGE_LENGTH_MAIN,    // 使用预设边长度
            edge_type: edge.edge_type,   // 边类型（物理连接/逻辑连接等）
            protocol: edge.protocol,     // 网络协议
            layer: edge.layer,           // 网络层次（如L2/L3）
            color: 'black'
        });
    }
};

/* ======================== 节点两端处理函数 ======================== */

/**
 * 处理边缘节点逻辑（动态创建未定义的节点）
 * @param {string} nodeId - 需要处理的节点ID
 * @returns {number} 节点在系统中的实际ID
 */
export const handleEdgeNode = (nodeId, data) => {
    // 检查节点是否已存在
    if (!appState.ipToId.has(nodeId)) {
        // 尝试在原始数据中查找节点定义
        const originalNode = data.nodes.find(n => n.node_id === nodeId);

        if (originalNode) {
            // 创建完整定义的节点
            addNodeWithChildren(originalNode, data, nodeId);
        } else {
            // 创建自动生成的临时节点
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
            appState.ipToId.set(nodeId, newId);
        }
    }
    return appState.ipToId.get(nodeId);
};
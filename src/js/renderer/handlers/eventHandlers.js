/**
 * 网络图事件处理模块
 * 功能：处理网络图的交互事件，包括稳定状态处理、右键菜单、节点操作等
 */

// 导入依赖模块
import { getNetworkOptions } from '../config/networkConfig.js';
import { autoSaveToJSON } from '../utils/utils.js';
import { appState } from '../utils/state.js';
import { calculateVulnerability } from './dataHandlers.js';

/**
 * 处理网络图稳定状态事件
 * @param {number} stabilizedTimer - 稳定状态定时器
 * @returns {number} - 更新后的稳定状态定时器
 */
const handleStabilized = (stabilizedTimer) => {
    clearTimeout(stabilizedTimer);
    stabilizedTimer = setTimeout(() => {
        const options = getNetworkOptions();
        options.physics.enabled = false;
        appState.network.setOptions(options);
    }, 300);
    return stabilizedTimer;
};

/**
 * 处理网络图右键上下文菜单事件
 * @param {Object} params - 事件参数
 * @param {string|null} hoveredNodeId - 鼠标悬停的节点 ID
 * @param {string} filePath - 自动保存的 JSON 文件路径
 */
const handleContextMenu = (params, hoveredNodeId, filePath) => {
    params.event.preventDefault();
    const menu = document.getElementById('nodeContextMenu');
    menu.style.display = 'none';

    if (hoveredNodeId !== null) {
        const node = appState.nodes.get(hoveredNodeId);
        menu.style.display = 'block';
        menu.style.left = `${params.event.pageX}px`;
        menu.style.top = `${params.event.pageY}px`;

        /**
         * 处理查看节点详情菜单项点击事件
         */
        const handleViewDetails = () => {
            const detailContent = `
                <h4>节点详情</h4>
                <p>IP地址: ${node.label}</p>
                <p>状态: ${node.state === 'up' ? '✅ 在线' : '❌ 离线'}</p>
                <p>操作系统: ${node.os || '未知'}</p>
                <p>MAC地址: ${node.mac_address || '未获取'}</p>
                <p>开放端口: ${Array.isArray(node.open_ports) ?
                    node.open_ports.map(p => p.port).join(', ') :
                    (typeof node.open_ports === 'object' ? node.open_ports.port : node.open_ports)
                }</p>
            `;
            Swal.fire({
                title: '节点信息',
                html: detailContent,
                confirmButtonText: '关闭',
                width: '600px'
            });
            menu.style.display = 'none';
        };
        document.getElementById('viewDetails').onclick = handleViewDetails;

        /**
         * 处理修改节点信息菜单项点击事件
         */
        const handleModifyNode = () => {
            Swal.fire({
                title: '修改节点信息',
                html: `
                    <input id="swal-ip" class="swal2-input" placeholder="IP地址" value="${node.label}">
                    <select id="swal-status" class="swal2-select">
                        <option value="up" ${node.state === 'up' ? 'selected' : ''}>在线</option>
                        <option value="down" ${node.state === 'down' ? 'selected' : ''}>离线</option>
                    </select>
                    <input id="swal-os" class="swal2-input" placeholder="操作系统" value="${node.os || ''}">
                    <input id="swal-ports" class="swal2-input" 
                           placeholder="开放端口 (格式: 端口/协议, 如 80/http)" 
                           value="${Array.isArray(node.open_ports) ?
                        node.open_ports.map(p => `${p.port}${p.protocol ? '/' + p.protocol : ''}`).join(', ') :
                        ''
                    }">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const originalPorts = node.open_ports || [];
                    const inputPorts = document.getElementById('swal-ports').value
                        .split(',')
                        .map(entry => {
                            const trimmed = entry.trim();
                            if (!trimmed) return null;
                            const [portStr, protocol = "tcp"] = trimmed.split('/');
                            const port = parseInt(portStr, 10);
                            return isNaN(port) ? null : { port, protocol: protocol.trim() };
                        })
                        .filter(Boolean);

                    if (inputPorts.length === 0) {
                        Swal.showValidationMessage('端口不能为空');
                        return false;
                    }

                    return {
                        label: document.getElementById('swal-ip').value,
                        status: document.getElementById('swal-status').value,
                        os: document.getElementById('swal-os').value,
                        ports: inputPorts.map(({ port, protocol }) => {
                            const existingPort = originalPorts.find(p => p.port === port);
                            return existingPort ?
                                { ...existingPort, protocol } :
                                { port, protocol, service: "unknown", version: "" };
                        })
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const data = result.value;
                    appState.nodes.update({
                        id: hoveredNodeId,
                        label: data.label,
                        state: data.status,
                        os: data.os,
                        open_ports: data.ports,
                        color: data.status === 'up' ?
                            { background: "#F0E68C", border: "#B8860B" } :
                            { background: "#D3D3D3", border: "#808080" }
                    });
                    appState.network.redraw();
                    autoSaveToJSON(filePath);
                }
            });
            menu.style.display = 'none';
        };
        document.getElementById('modifyNode').onclick = handleModifyNode;

        /**
         * 处理删除节点菜单项点击事件
         */
        const handleDeleteNode = () => {
            Swal.fire({
                title: '确认删除节点？',
                text: "该操作将同时删除所有关联的连接！",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: '确认删除'
            }).then((result) => {
                if (result.isConfirmed) {
                    const connectedEdges = appState.network.getConnectedEdges(hoveredNodeId);
                    appState.nodes.remove(hoveredNodeId);
                    appState.edges.remove(connectedEdges);
                    appState.network.redraw();
                    autoSaveToJSON(filePath);
                }
            });
            menu.style.display = 'none';
        };
        document.getElementById('deleteNode').onclick = handleDeleteNode;
    }
};

/**
 * 处理页面点击事件，隐藏右键上下文菜单
 */
const handlePageClick = () => {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-context-menu')) {
            document.getElementById('nodeContextMenu').style.display = 'none';
        }
    });
};

/**
 * 设置漏洞分析按钮点击事件监听器
 */
const setupVulnerabilityAnalysisClick = () => {
    const vulnerabilityAnalysisElement = document.getElementById('vulnerabilityAnalysis');
    if (vulnerabilityAnalysisElement) {
        vulnerabilityAnalysisElement.addEventListener('click', calculateVulnerability);
    } else {
        console.warn('未找到 id 为 vulnerabilityAnalysis 的元素');
    }
};

/**
 * 处理子网节点双击事件
 * @param {Object} params - 双击事件参数
 * @param {string} filePath - 自动保存的 JSON 文件路径
 */
const handleSubnetDoubleClick = (params, filePath) => {
    if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        const clickedNode = appState.nodes.get(clickedNodeId);
        if (clickedNode.node_type === 'subnet') {
            console.log("双击了subnet节点:", clickedNode.label);
            // 获取子节点
            const connectedEdges = appState.network.getConnectedEdges(clickedNodeId);
            const childNodes = [];
            const edgesToHide = []; // 改为存储需要隐藏的边
            const newEdges = [];
            const newEdgeIds = []; // 新增：用于存储新添加边的id
            connectedEdges.forEach(edgeId => {
                const edge = appState.edges.get(edgeId);
                const targetNodeId = edge.from === clickedNodeId ? edge.to : edge.from;
                const targetNode = appState.nodes.get(targetNodeId);
                if (targetNode.parent === clickedNode.label) {
                    childNodes.push(targetNodeId);
                    edgesToHide.push(edgeId); // 记录需要隐藏的边

                    // 获取连接到子节点的边
                    const childConnectedEdges = appState.network.getConnectedEdges(targetNodeId);
                    childConnectedEdges.forEach(childEdgeId => {
                        const childEdge = appState.edges.get(childEdgeId);
                        const otherNodeId = childEdge.from === targetNodeId ? childEdge.to : childEdge.from;
                        if (otherNodeId !== clickedNodeId) {
                            // 记录需要隐藏的边
                            edgesToHide.push(childEdgeId);
                            // 记录新的连接到subnet节点的边
                            newEdges.push({
                                from: otherNodeId,
                                to: clickedNodeId,
                                // 可以根据需要复制其他边的属性
                                length: childEdge.length,
                                edge_type: childEdge.edge_type,
                                protocol: childEdge.protocol,
                                layer: childEdge.layer,
                                color: childEdge.color
                            });
                        }
                    });
                }
            });

            // 收缩或展开子节点
            const isChildNodesVisible = childNodes.some(nodeId => appState.nodes.get(nodeId).hidden !== true);
            console.log("当前子节点可见状态:", isChildNodesVisible);
            childNodes.forEach(nodeId => {
                appState.nodes.update({ id: nodeId, hidden: isChildNodesVisible });
            });
            // 隐藏相关边
            edgesToHide.forEach(edgeId => {
                appState.edges.update({ id: edgeId, hidden: isChildNodesVisible });
            });
            // 添加新边
            if (isChildNodesVisible) {
                const addedEdges = appState.edges.add(newEdges);
                newEdgeIds.push(...addedEdges); // 记录新添加边的id
            } else {
                const edgesToRemove = [];
                newEdges.forEach((newEdge) => {
                    const existingEdges = appState.edges.get({
                        filter: (edge) => edge.from === newEdge.from && edge.to === newEdge.to
                    });
                    existingEdges.forEach((edge) => {
                        edgesToRemove.push(edge.id);
                    });
                });
                appState.edges.remove(edgesToRemove);
            }

            // 刷新网络以应用更改
            appState.network.redraw();
            autoSaveToJSON(filePath);
        }
    }
};

/**
 * 设置网络图事件监听
 * @param {string} filePath - 自动保存的 JSON 文件路径
 */
export const setupNetworkEvents = (filePath) => {
    let stabilizedTimer;
    let hoveredNodeId = null;
    // 网络稳定事件处理
    appState.network.on("stabilized", () => {
        stabilizedTimer = handleStabilized(stabilizedTimer);
    });

    // 右键上下文菜单处理
    appState.network.on("oncontext", (params) => {
        handleContextMenu(params, hoveredNodeId, filePath);
    });

    // 页面点击事件处理
    handlePageClick();

    // 双击事件处理
    appState.network.on("doubleClick", (params) => {
        handleSubnetDoubleClick(params, filePath);
    });

    appState.network.on("hoverNode", (params) => {
        hoveredNodeId = params.node;
    });

    appState.network.on("blurNode", () => {
        hoveredNodeId = null;
    });
    appState.network.on("selectNode", function (params) { });
    appState.network.on("click", function (params) { });
    appState.network.on("dragging", function (params) { });
    appState.network.on("dragEnd", function (params) { });
    appState.network.on("zoom", function (params) { });

    setupVulnerabilityAnalysisClick();
};
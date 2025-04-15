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
                title: '节点详情',
                html: detailContent,
                confirmButtonText: '关闭',
                width: '650px',
                background: '#f8f9fa',
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    content: 'custom-swal-content',
                    confirmButton: 'custom-swal-confirm-btn'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInDown animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp animate__faster'
                }
            });
            menu.style.display = 'none';
        };
        document.getElementById('viewDetails').onclick = handleViewDetails;

        /**
         * 处理修改节点信息菜单项点击事件
         */
        const handleModifyNode = () => {
            Swal.fire({
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    content: 'custom-swal-content',
                    confirmButton: 'custom-swal-confirm-btn'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                },
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
        if (appState.network.isCluster(clickedNodeId)) {
            // 展开前启用物理引擎
            const options = getNetworkOptions();
            options.physics = {
                enabled: true,
                solver: 'forceAtlas2Based',
                stabilization: { iterations: 50 }
            };
            appState.network.setOptions(options);

            // 展开集群
            appState.network.openCluster(clickedNodeId, {
                releaseFunction: (clusterPosition, containedNodesPositions) => {
                    // 确保containedNodesPositions是数组
                    const nodesPositions = Array.isArray(containedNodesPositions)
                        ? containedNodesPositions
                        : Object.values(containedNodesPositions);

                    // 以子网节点为中心辐射状分布
                    const radius = 150;
                    return nodesPositions.map((pos, i) => {
                        const angle = (i * 2 * Math.PI) / nodesPositions.length;
                        return {
                            x: clusterPosition.x + radius * Math.cos(angle),
                            y: clusterPosition.y + radius * Math.sin(angle)
                        };
                    });
                }
            });

            // 自动稳定后关闭物理引擎
            setTimeout(() => {
                options.physics.enabled = false;
                appState.network.setOptions(options);
            }, 1000);
        } else if (clickedNode.node_type === 'subnet') {
            console.log(`双击子网节点: ${clickedNode.label}`);
            // const connectedNodes = appState.network.getConnectedNodes(clickedNodeId);
            // for (const nodeId of connectedNodes) {
            //     const node = appState.nodes.get(parseInt(nodeId));
            //     if (appState.network.isCluster(parseInt(nodeId))){
            //         console.log(node.label);
            //     }
            //     if(node.node_type === 'subnet' && !appState.network.isCluster(parseInt(nodeId)) && node.parent === clickedNode.label){
            //         console.log(node.label);
            //         handleSubnetDoubleClick({ nodes: [parseInt(nodeId)] }, filePath);//递归调用
            //     }
            // }
            // var visibleNodes = [];
            // for (var nodeId in appState.network.body.nodes) {
            //     // we check if the node is inside a cluster
            //     if (!appState.network.clustering.clusteredNodes[nodeId]) {
            //         var node = appState.network.body.nodes[parseInt(nodeId)];
            //         console.log(node.options);
            //         if(node.options.parent === clickedNode.label && !appState.network.isCluster(parseInt(nodeId)))
            //             handleSubnetDoubleClick({ nodes: [parseInt(nodeId)] }, filePath);//递归调用;
            //     }
            // }
            // 使用vis.js原生集群功能
            const clusterOptions = {
                joinCondition: (childOptions) => {
                    if(childOptions.parent === clickedNode.label && !appState.network.isCluster(childOptions.id)){
                        handleSubnetDoubleClick({ nodes: [childOptions.id] }, filePath);//递归调用;
                    }
                    return childOptions.parent === clickedNode.label ||
                        childOptions.id === clickedNodeId;
                },
                clusterNodeProperties: {
                    label: `子网: ${clickedNode.label}`,
                    node_type: "subnet",
                    parent: clickedNode.parent,
                    shape: 'box',
                    color: clickedNode.color,
                    font: { size: 14 },
                    borderWidth: 2,
                    borderColor: clickedNode.color.border,
                    background: "#87CEEB",
                    border: "#4682B4",
                    highlight: { background: "#B0E0E6", border: "#5F9EA0" },
                    hover: { background: "#B0E0E6", border: "#4682B4" },
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.3)',
                        size: 8,
                        x: 2,
                        y: 2
                    }
                },
                // processProperties: (clusterOptions, childNodes) => {
                //     for (var i = 0; i < childNodes.length; i++) {
                //         if (childNodes[i].node_type === 'subnet' && childNodes[i].label !== clickedNode.label && !appState.network.isCluster(childNodes[i].id)) {
                //             console.log(childNodes[i].label);
                //             // handleSubnetDoubleClick({ nodes: [childNodes[i].id] }, filePath);//递归调用
                //         }
                //     }
                // }
            };
            appState.network.clustering.cluster(clusterOptions);
            appState.network.clustering.cluster(clusterOptions);
            // autoSaveToJSON(filePath);
        }
    }
};

/**
 * 设置网络图事件监听
 * @param {string} filePath - 自动保存的 JSON 文件路径
 */

const createSubnetNode = (id, label, description, children = []) => ({
    id: id,
    label: label,
    node_type: 'subnet',
    parent: null,
    description: description,
    children: children,  // 添加children属性存储子节点ID
    font: {
        face: 'Arial',
        size: 14,
        color: 'rgba(232, 159, 159, 0.9)',
        strokeWidth: 2,
        strokeColor: 'rgba(0,0,0,0.7)'
    },
    color: {
        background: "#87CEEB",
        border: "#4682B4",
        highlight: { background: "#B0E0E6", border: "#5F9EA0" },
        hover: { background: "#B0E0E6", border: "#4682B4" }
    },
    shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.3)',
        size: 8,
        x: 2,
        y: 2
    },
    shape: 'dot',
    margin: 10
});

// 在handleAddSubnet函数中修改创建子网节点的部分
const handleAddSubnet = (filePath) => {
    // 获取所有现有节点
    const allNodes = appState.nodes.get();

    // 弹出节点选择对话框
    Swal.fire({
        customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            content: 'custom-swal-content',
            confirmButton: 'custom-swal-confirm-btn'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster'
        },
        title: '创建子网',
        width: '800px',
        html: `
            <div style="margin-bottom: 15px;">
                <input id="subnet-name" class="swal2-textarea" placeholder="子网名称 (如: 财务部子网)" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <input id="subnet-desc" class="swal2-textarea" placeholder="子网描述 (可选)" style="width: 100%; min-height: 80px;">
            </div>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                <h4 style="margin-top: 0;">选择节点 (可多选)</h4>
                <div id="node-selection-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px;">
                    ${allNodes
                .map(node => `
                            <label style="display: flex; align-items: center; padding: 8px; border-radius: 4px; background: #f5f5f5; cursor: pointer;">
                                <input type="checkbox" value="${node.id}" style="margin-right: 8px;">
                                <div style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${node.color?.background || '#ccc'}; margin-right: 8px;"></div>
                                ${node.label || node.id}
                            </label>
                        `).join('')}
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '创建子网',
        cancelButtonText: '取消',
        preConfirm: () => {
            const selectedNodes = Array.from(document.querySelectorAll('#node-selection-container input:checked'))
                .map(checkbox => checkbox.value);

            if (selectedNodes.length === 0) {
                Swal.showValidationMessage('请至少选择一个节点');
                return false;
            }
            if (!document.getElementById('subnet-name').value.trim()) {
                Swal.showValidationMessage('请输入子网名称');
                return false;
            }

            return {
                name: document.getElementById('subnet-name').value.trim(),
                desc: document.getElementById('subnet-desc').value.trim(),
                nodes: selectedNodes
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // 将节点ID数组转换为IP地址数组
            const ipArray = result.value.nodes.map(nodeId => {
                // 遍历ipToId映射表查找对应的IP
                const node = appState.nodes.get(parseInt(nodeId));
                console.log("当前节点:", node.label);
                node.parent = result.value.name;
                console.log("当前节点parent:", node.parent);
                appState.nodes.update(node);
                return node.label;
            });
            const subnetId = appState.incrementId();
            appState.ipToId.set(result.value.name, subnetId);
            const subnetNode = createSubnetNode(
                subnetId,
                result.value.name,
                result.value.desc,
                ipArray  // 使用IP地址数组而不是ID数组
            );
            // 添加子网节点到数据集
            appState.nodes.add(subnetNode);

            // 启用物理引擎以自动布局
            const options = getNetworkOptions();
            options.physics = {
                enabled: true,
                solver: 'forceAtlas2Based',
                stabilization: { iterations: 50 }
            };
            appState.network.setOptions(options);

            // 自动稳定后关闭物理引擎
            setTimeout(() => {
                options.physics.enabled = false;
                appState.network.setOptions(options);
            }, 1000);

            // 创建子网关系边
            const edges = result.value.nodes.map(nodeId => ({
                from: subnetNode.id,
                to: nodeId,
                edge_type: 'subnet_member',
                dashes: true,
                color: '#808080'
            }));

            appState.edges.add(edges);
            appState.network.fit({
                nodes: [subnetNode.id],
                animation: true
            });
            // autoSaveToJSON(filePath);
        }
    });
};

// 在 setupNetworkEvents 函数中修改调用方式
export const setupNetworkEvents = (filePath) => {
    let stabilizedTimer; // 稳定状态定时器
    let hoveredNodeId = null; // 鼠标悬停的节点 ID

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

    // 添加子网按钮点击事件
    document.getElementById('addsubnet').addEventListener('click', () => {
        handleAddSubnet(filePath);
    });

    // 节点悬停事件处理
    appState.network.on("hoverNode", (params) => {
        hoveredNodeId = params.node;
    });

    // 节点离开事件处理
    appState.network.on("blurNode", () => {
        hoveredNodeId = null;
    });

    appState.network.on("selectNode", function (params) { });
    appState.network.on("click", function (params) { });
    appState.network.on("dragging", function (params) { });
    appState.network.on("dragEnd", function (params) { });
    appState.network.on("zoom", function (params) { });

    // 漏洞分析按钮点击事件
    setupVulnerabilityAnalysisClick();
};
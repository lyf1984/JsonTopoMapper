import { getNetworkOptions } from '../config/networkConfig.js';
import { autoSaveToJSON } from '../utils/utils.js';
import { appState } from '../utils/state.js';
export const setupNetworkEvents = (filePath) => {

    var stabilizedTimer;
    var hoveredNodeId = null;

    //动画稳定后的处理事件
    appState.network.on("stabilized", function () {
        clearTimeout(stabilizedTimer);
        stabilizedTimer = setTimeout(() => {
            var options = getNetworkOptions();
            options.physics.enabled = false; // 关闭物理系统
            appState.network.setOptions(options);
            // network.fit({ animation: true });
        }, 300);
    });



    // 右键点击事件处理
    appState.network.on("oncontext", function (params) {
        params.event.preventDefault();
        const menu = document.getElementById('nodeContextMenu');
        menu.style.display = 'none';
        // 右键点击的是节点
        if (hoveredNodeId != null) {
            // console.log("被右键了");
            const node = appState.nodes.get(hoveredNodeId);
            // 更新菜单位置
            menu.style.display = 'block';
            menu.style.left = `${params.event.pageX}px`;
            menu.style.top = `${params.event.pageY}px`;
            // 查看详情
            document.getElementById('viewDetails').onclick = () => {
                const detailContent = `
			  <h4>节点详情</h4>
			  <p>IP地址: ${node.label}</p>
			  <p>状态: ${node.state === 'up' ? '✅ 在线' : '❌ 离线'}</p>
			  <p>操作系统: ${node.os || '未知'}</p>
			  <p>MAC地址: ${node.mac_address || '未获取'}</p>
			  <p>开放端口: ${Array.isArray(node.open_ports) ? node.open_ports.map(p => p.port).join(', ') : (typeof node.open_ports === 'object' ? node.open_ports.port : node.open_ports)}</p>
			`;
                Swal.fire({
                    title: '节点信息',
                    html: detailContent,
                    confirmButtonText: '关闭',
                    width: '600px'
                });
                menu.style.display = 'none';
            };

            document.getElementById('modifyNode').onclick = () => {
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
                            ''}">
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

                        const processedPorts = inputPorts.map(({ port, protocol }) => {
                            const existingPort = originalPorts.find(p => p.port === port);
                            return existingPort ?
                                { ...existingPort, protocol } :
                                { port, protocol, service: "unknown", version: "" };
                        });

                        return {
                            label: document.getElementById('swal-ip').value,
                            status: document.getElementById('swal-status').value,
                            os: document.getElementById('swal-os').value,
                            ports: processedPorts
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

            // 删除节点
            document.getElementById('deleteNode').onclick = () => {
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
                        // 获取所有关联的边
                        const connectedEdges = appState.network.getConnectedEdges(hoveredNodeId);

                        // 删除节点和关联的边
                        appState.nodes.remove(hoveredNodeId);
                        appState.edges.remove(connectedEdges);

                        // 刷新网络
                        appState.network.redraw();
                        autoSaveToJSON(filePath);
                    }
                });
                menu.style.display = 'none';
            };
        }
    });

    // 点击页面其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-context-menu')) {
            document.getElementById('nodeContextMenu').style.display = 'none';
        }
    });

    //选中节点
    appState.network.on("selectNode", function (params) { });

    //单击节点
    appState.network.on("click", function (params) { });

    //拖动节点
    appState.network.on("dragging", function (params) {
    });

    //拖动结束后
    appState.network.on("dragEnd", function (params) {
    });

    // 缩放
    appState.network.on("zoom", function (params) { });

    // 监听鼠标悬停节点事件
    appState.network.on("hoverNode", (params) => {
        hoveredNodeId = params.node;
    });

    // 监听鼠标离开节点事件
    appState.network.on("blurNode", () => {
        hoveredNodeId = null;
    });
};
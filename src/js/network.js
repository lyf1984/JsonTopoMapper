/* 网络拓扑图主程序 */
// 声明全局变量
let idCounter = 1; // ID计数器
let hoveredNodeId = null;
var container = document.getElementById('mynetwork');  // 网络图容器
var network = null;                                    // vis网络图实例
var options;                                            // 网络图配置项
var DIR = 'assets/refresh-cl/';                        // 资源目录
var EDGE_LENGTH_MAIN = 100;                            // 主连接线长度
var EDGE_LENGTH_SUB = 50;                              // 子连接线长度

// 使用vis.DataSet初始化节点和边数据集
const nodes = new vis.DataSet();
const edges = new vis.DataSet();
const ipToId = {}; // 存储节点ID到生成的节点ID的映射

//处理端口信息
const parsePorts = (ports) => {
	if (!ports) return '无'; // 字段不存在
	if (typeof ports === 'number') return ports; // 单个端口号（数字）
	if (typeof ports === 'string') return ports; // 字符串格式的端口（如 "80,443"）

	// 如果是数组
	if (Array.isArray(ports)) {
		// 提取对象中的 port 字段（如果元素是对象）
		const portList = ports.map(item => {
			if (typeof item === 'object' && item.port !== undefined) {
				return item.port; // 从对象中提取端口号
			}
			return item; // 直接是数字或字符串
		});
		return portList.join(', ') || '无';
	}

	return '无'; // 其他未知类型
};

// 动态生成节点信息卡片的函数
function generateNodeTile(node) {
	// 深度处理 open_ports 字段
	return `
	  <div style="padding:15px;">
		<h5 style="margin-bottom:10px;">IP(${node.node_id || '未知'})</h5>
		<h5 style="margin-bottom:10px;">
		  状态：<span title="${node.state || '未知'}">
			${node.state === 'up' ? '✅ 在线' : '❌ 离线'}
		  </span>
		</h5>
		<h5 style="margin-bottom:10px;">操作系统：${node.os || '未知'}</h5>
		<h5 style="margin-bottom:10px;">
		  开放端口：${parsePorts(node.open_ports)}
		</h5>
		<h5>MAC：${node.mac_address || '未知'}</h5>
	  </div>
	`;
};

// 递归函数添加节点及其子节点
function addNodeWithChildren(node, data,parentId = null) {
	// 生成当前节点ID并存储映射
	const currentNodeId = idCounter;
	nodes.add({
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
	ipToId[node.node_id] = currentNodeId;
	idCounter++;

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
				addNodeWithChildren(childNode, data,currentNodeId);
			} else {
				// 未找到时创建占位节点
				console.warn(`子节点 ${childId} 未定义，创建占位节点`);
				addNodeWithChildren({
					node_id: childId,
					node_type: 'unknown',
					state: 'down'
				}, data,currentNodeId);
			}
		});
	}
}

//处理边的两端节点
const handleEdgeNode = (nodeId,data) => {
	if (!ipToId[nodeId]) {
		// 尝试在原始数据中查找节点定义
		const originalNode = data.nodes.find(n => n.node_id === nodeId);
		if (originalNode) {
			// 如果找到未处理的节点，完整添加
			addNodeWithChildren(originalNode,data,nodeId);
			return ipToId[nodeId];
		} else {
			// 创建自动生成的节点
			const newId = idCounter++;
			nodes.add({
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
			ipToId[nodeId] = newId;
			return newId;
		}
	}
	return ipToId[nodeId];
};

/* 监听Electron文件打开事件 */
window.api.onFilePath(async (filePath) => {
	try {
		const content = await window.api.readFile(filePath);
		console.log("filepath:", filePath);
		const data = JSON.parse(content);
		nodes.clear();
		edges.clear();
		let idCounter = 1; // 重置ID计数器
		// 处理所有顶级节点
		data.nodes.forEach(node => addNodeWithChildren(node));
		// 处理边时自动补全节点（改进部分）
		data.edges.forEach(edge => {
			const fromId = handleEdgeNode(edge.from_node,data);
			const toId = handleEdgeNode(edge.to_node,data);
			edges.add({
				from: fromId,
				to: toId,
				length: EDGE_LENGTH_MAIN,
				edge_type: edge.edge_type,
				protocol: edge.protocol,
				layer: edge.layer,
				color: 'black',
				dashes: !ipToId[edge.from_node] || !ipToId[edge.to_node] // 虚线表示包含自动创建的节点
			});

		});
		initNetwork(filePath); // 初始化
	} catch (error) {
		console.error('文件读取失败:', error);
	}
});

// 新增的初始化函数
function initNetwork(filePath) {
	options = {
		autoResize: true,
		height: '100%',
		width: '100%',
		nodes: {
			font: {
				color: "#595959",
				size: 5
			}
		},
		edges: {
			smooth: false, //是否显示方向箭头
			color: "#c8c8c8" // 线条颜色
		},
		layout: {
			improvedLayout: false
		},
		interaction: {
			navigationButtons: false, // 如果为真，则在网络画布上绘制导航按钮。这些是HTML按钮，可以使用CSS完全自定义。
			keyboard: {
				enabled: false,
			} // 启用键盘快捷键
		},
		physics: {
			enabled: true,
			solver: "barnesHut",
			barnesHut: {
				gravitationalConstant: -4000,
				centralGravity: 0.3,
				springLength: 120,
				springConstant: 0.04,
				damping: 0.09,
				avoidOverlap: 0.2
			},
		},
		interaction: {
			hover: true,
		},
	};
	network = new vis.Network(container, { nodes, edges }, options); // 真正初始化 network


	//动画稳定后的处理事件
	var stabilizedTimer;
	network.on("stabilized", function () {
		clearTimeout(stabilizedTimer);
		stabilizedTimer = setTimeout(() => {
			options.physics.enabled = false; // 关闭物理系统
			network.setOptions(options);
			// network.fit({ animation: true });
		}, 300);
	});



	// 右键点击事件处理
	network.on("oncontext", function (params) {
		params.event.preventDefault();
		const menu = document.getElementById('nodeContextMenu');
		menu.style.display = 'none';
		// 右键点击的是节点
		if (hoveredNodeId != null) {
			// console.log("被右键了");
			const node = nodes.get(hoveredNodeId);
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
						nodes.update({
							id: hoveredNodeId,
							label: data.label,
							state: data.status,
							os: data.os,
							open_ports: data.ports,
							color: data.status === 'up' ?
								{ background: "#F0E68C", border: "#B8860B" } :
								{ background: "#D3D3D3", border: "#808080" }
						});
						network.redraw();
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
						const connectedEdges = network.getConnectedEdges(hoveredNodeId);

						// 删除节点和关联的边
						nodes.remove(hoveredNodeId);
						edges.remove(connectedEdges);

						// 刷新网络
						network.redraw();
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
	network.on("selectNode", function (params) { });

	//单击节点
	network.on("click", function (params) { });

	//拖动节点
	network.on("dragging", function (params) {
	});

	//拖动结束后
	network.on("dragEnd", function (params) {
	});

	// 缩放
	network.on("zoom", function (params) { });

	// 监听鼠标悬停节点事件
	network.on("hoverNode", (params) => {
		hoveredNodeId = params.node;
	});

	// 监听鼠标离开节点事件
	network.on("blurNode", () => {
		hoveredNodeId = null;
	});

}

// 自动保存到JSON文件
function autoSaveToJSON(filePath) {
	const updatedData = {
		nodes: nodes.get().map(node => ({
			node_id: node.label,
			node_type: node.node_type,
			state: node.state,
			fqdn: node.fqdn,
			reverse_dns: node.reverse_dns,
			mac_address: node.mac_address,
			vendor: node.vendor,
			open_ports: node.open_ports,
			os: node.os
		})),
		edges: edges.get().map(edge => ({
			from_node: nodes.get(edge.from).label,
			to_node: nodes.get(edge.to).label,
			edge_type: edge.edge_type,
			protocol: edge.protocol,
			layer: edge.layer
		}))
	};
	window.api.writeFile(filePath, JSON.stringify(updatedData, null, 2));
}


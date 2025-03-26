var container = document.getElementById('mynetwork');
var network = null;
var options;
var DIR = 'assets/refresh-cl/';
var EDGE_LENGTH_MAIN = 100;
var EDGE_LENGTH_SUB = 50;
// 初始化 nodes 和 edges 使用 vis.DataSet
const nodes = new vis.DataSet();
const edges = new vis.DataSet();
const ipToId = {}; // 用于存储 IP 到 ID 的映射
let idCounter = 1; // 初始化 ID 计数器



// 动态生成节点信息卡片的函数
function generateNodeTile(node) {
	// 深度处理 open_ports 字段
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
}

fetch('./js/output.json')
    .then(response => response.json())
    .then(data => {
        nodes.clear();
        edges.clear();
        const ipToId = {}; // 存储节点ID到生成的节点ID的映射
        let idCounter = 1; // 重置ID计数器

        // 递归函数添加节点及其子节点
        function addNodeWithChildren(node, parentId = null) {
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
                opacity: 1,
                title: generateNodeTile(node),
            });
            ipToId[node.node_id] = currentNodeId;
            idCounter++;

            // 添加连接到父节点的边
            if (parentId !== null) {
                edges.add({
                    from: parentId,
                    to: currentNodeId,
                    length: EDGE_LENGTH_MAIN,
                    color: '#808080' // 子节点连接线使用灰色
                });
            }

            // 递归处理子节点
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    addNodeWithChildren(child, currentNodeId);
                });
            }
        }

        // 处理所有顶级节点
        data.nodes.forEach(node => addNodeWithChildren(node));

        // 处理边并自动创建缺失节点
        data.edges.forEach(edge => {
            const handleMissingNode = (nodeId) => {
                if (!ipToId[nodeId]) {
                    const newId = idCounter++;
                    nodes.add({
                        id: newId,
                        label: nodeId,
                        node_type: 'auto',
                        shape: "circle",
                        color: {
                            background: "#E0FFFF", // 浅青色标识自动创建的节点
                            border: "#4682B4",
                            highlight: { background: "#AFEEEE", border: "#5F9EA0" },
                            hover: { background: "#AFEEEE", border: "#5F9EA0" }
                        },
                        title: `Automatically created node for: ${nodeId}`
                    });
                    ipToId[nodeId] = newId;
                    idCounter++;
                    return newId;
                }
                return ipToId[nodeId];
            };

            const fromId = handleMissingNode(edge.from_node);
            const toId = handleMissingNode(edge.to_node);
            
            edges.add({
                from: fromId,
                to: toId,
                length: EDGE_LENGTH_MAIN,
				edge_type:edge.edge_type,
				protocol:edge.protocol,
				layer:edge.layer,
                color: 'black',
                dashes: !ipToId[edge.from_node] || !ipToId[edge.to_node] // 虚线表示包含自动创建的节点
            });
			// console.log(edge.from_node+edge.to_node);
			
        });

        network.setData({ nodes, edges });
    })
    .catch(error => console.error('Error loading JSON:', error));




var options = {
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
		barnesHut: {
			gravitationalConstant: -4000,
			centralGravity: 0.3,
			springLength: 120,
			springConstant: 0.04,
			damping: 0.09,
			avoidOverlap: 0
		}
	},
	interaction: {
		hover: true,
	},
};

// Called when the Visualization API is loaded.
function draw() {
	var data = {
		nodes: nodes,
		edges: edges
	};
	network = new vis.Network(container, data, options);

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



	network.on("oncontext", function (params) {

		params.event.preventDefault();
		$(".custom-menu").finish().toggle(100);
		$(".custom-menu").css({
			top: params.event.pageY + "px",
			left: params.event.pageX + "px"
		});
	});


	// 自动保存到本地JSON文件
	function autoSaveToJSON() {
		const updatedData = {
			nodes: nodes.get().map(node => ({
				node_id: node.label,
				node_type: node.node_type,
				state: node.state,
				fqdn:node.fqdn,
				reverse_dns:node.reverse_dns,
				mac_address: node.mac_address,
				vendor:node.vendor,
				open_ports: node.open_ports,
				os: node.os
			})),
			edges: edges.get().map(edge => ({
				from_node: nodes.get(edge.from).label,
				to_node: nodes.get(edge.to).label,
				edge_type:edge.edge_type,
				protocol:edge.protocol,
				layer:edge.layer
			}))
		};

		// 创建可下载的JSON文件
		const dataStr = "data:text/json;charset=utf-8," +
			encodeURIComponent(JSON.stringify(updatedData, null, 2));

		// 自动触发下载（会覆盖原文件）
		const downloadLink = document.createElement('a');
		downloadLink.href = dataStr;
		downloadLink.download = 'output.json';
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}
	

	// 右键点击事件处理
	network.on("oncontext", function (params) {
		params.event.preventDefault();
		const menu = document.getElementById('nodeContextMenu');
		menu.style.display = 'none';

		if (params.nodes.length > 0) {
			// 右键点击的是节点
			const nodeId = params.nodes[0];
			const node = nodes.get(nodeId);

			// 更新菜单位置
			menu.style.display = 'block';
			menu.style.left = `${params.event.pageX}px`;
			menu.style.top = `${params.event.pageY}px`;
			// 查看详情
			document.getElementById('viewDetails').onclick = () => {
				const detailContent = `
			  <h4>节点详情</h4>
			  <p>IP地址: ${node.label}</p>
			  <p>状态: ${node.node_state === 'up' ? '在线' : '离线'}</p>
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
				const node = nodes.get(nodeId);
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
							 node.open_ports.map(p => `${p.port}${p.protocol ? '/'+p.protocol : ''}`).join(', ') : 
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
					  id: nodeId,
					  label: data.label,
					  state: data.status,
					  os: data.os,
					  open_ports: data.ports,
					  color: data.status === 'up' ? 
						{ background: "#F0E68C", border: "#B8860B" } : 
						{ background: "#D3D3D3", border: "#808080" }
					});
					network.redraw();
					autoSaveToJSON();
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
						const connectedEdges = network.getConnectedEdges(nodeId);

						// 删除节点和关联的边
						nodes.remove(nodeId);
						edges.remove(connectedEdges);

						// 刷新网络
						network.redraw();
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

	// //双击节点
	// network.on("doubleClick", function (params) {
	// 	if (params.nodes.length !== 0) {
	// 		const nodeId = params.nodes[0];
	// 		// nodes.update({
	// 		// 	id: nodeId,
	// 		// 	size: 40, // 节点变大
	// 		// 	color: {
	// 		// 		background: "yellow", // 节点背景变成黄色
	// 		// 		border: "orange",// 边框颜色变成橙色
	// 		// 		hover:"yellow"
	// 		// 	},
	// 		// 	isClicked:true
	// 		// });

	// 		options.physics.enabled = true; // 启用物理引擎
	// 		network.setOptions(options);

	// 		// 获取所有子节点
	// 		const childNodes = getAllChilds(network, nodeId, []);

	// 		// 更新子节点可见性
	// 		const updatedNodes = []; // 存储要更新的节点
	// 		nodes.forEach(node => {
	// 			if (childNodes.includes(node.id)) {
	// 				updatedNodes.push({
	// 					id: node.id,
	// 					hidden: !node.hidden // 切换可见性
	// 				});
	// 			}
	// 		});

	// 		// 更新可见性
	// 		if (updatedNodes.length > 0) {
	// 			nodes.update(updatedNodes);
	// 		}

	// 		// 停止物理引擎
	// 		setTimeout(() => {
	// 			options.physics.enabled = false;
	// 			network.setOptions(options);
	// 		}, 300); // 300ms 后停止物理引擎
	// 	}
	// });
	// 绑定右键事件




	//拖动节点
	network.on("dragging", function (params) {//拖动进行中事件
		if (params.nodes.length != 0) {
			nodeMoveFun(params);
		}
	});

	//拖动结束后
	network.on("dragEnd", function (params) {
		if (params.nodes.length != 0) {
			var arr = nodeMoveFun(params);
			exportNetworkPosition(network, arr);
		}
	});

	// 缩放
	network.on("zoom", function (params) { });
	network.on("hoverNode", function (params) {
		const nodeId = params.node; // 当前悬停的节点 ID
		const node = nodes.get(nodeId); // 获取该节点的属性

		// // 如果节点是双击过的，保持其颜色
		// if (node.isClicked) {
		// 	// 不改变颜色
		// 	network.canvas.body.container.style.cursor = 'default';
		// } else {
		// 	// 恢复默认的鼠标悬停颜色
		// 	network.canvas.body.container.style.cursor = 'pointer';
		// }
	})

}

$(function () {
	draw();
});

/*
 *获取所有子节点
 * network ：图形对象
 * _thisNode ：单击的节点（父节点）
 * _Allnodes ：用来装子节点ID的数组
 * */
function getAllChilds(network, nodeId, allNodes) {
	const connectedNodes = network.getConnectedNodes(nodeId, "to"); // 获取所有子节点
	connectedNodes.forEach(childId => {
		if (!allNodes.includes(childId)) {
			allNodes.push(childId); // 避免重复节点
			getAllChilds(network, childId, allNodes); // 递归查找子节点
		}
	});
	return allNodes;
};

// 节点移动
function nodeMoveFun(params) {
	const clickedNodeId = params.nodes[0];
	const childNodes = getAllChilds(network, clickedNodeId, []);

	if (childNodes.length > 0) {
		const positions = network.getPositions(); // 获取所有节点的位置
		const startPosition = positions[clickedNodeId]; // 当前节点的位置
		const moveX = startPosition.x - positions[clickedNodeId].x;
		const moveY = startPosition.y - positions[clickedNodeId].y;

		const updatedPositions = {};
		childNodes.forEach(childId => {
			const childPos = positions[childId];
			if (childPos) {
				updatedPositions[childId] = {
					x: childPos.x + moveX,
					y: childPos.y + moveY
				};
				network.moveNode(childId, updatedPositions[childId].x, updatedPositions[childId].y);
			}
		});
	}
};



/*
 *节点位置设置
 * network ：图形对象
 * arr ：本次移动的节点位置信息
 * */
function exportNetworkPosition(network, arr) {
	if (arr) { // 折叠过后  getPositions() 获取的位置信息里不包含隐藏的节点位置信息，这时候调用上次存储的全部节点位置，并修改这次移动的节点位置，最后保存
		var localtionPosition = JSON.parse(localStorage.getItem("position"));
		for (let index in arr) {
			localtionPosition[index] = {
				x: arr[index].x,
				y: arr[index].y
			}
		}
		setLocal(localtionPosition);

	} else {
		var position = network.getPositions();
		setLocal(position);
	}
};
//处理本地存储，这里仅仅只能作为高级浏览器使用，ie9以下不能处理
function setLocal(position) {
	localStorage.removeItem("position");
	localStorage.setItem("position", JSON.stringify(position));
}
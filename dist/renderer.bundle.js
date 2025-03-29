/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/renderer/config/networkConfig.js":
/*!*************************************************!*\
  !*** ./src/js/renderer/config/networkConfig.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DIR: () => (/* binding */ DIR),\n/* harmony export */   EDGE_LENGTH_MAIN: () => (/* binding */ EDGE_LENGTH_MAIN),\n/* harmony export */   EDGE_LENGTH_SUB: () => (/* binding */ EDGE_LENGTH_SUB),\n/* harmony export */   getNetworkOptions: () => (/* binding */ getNetworkOptions)\n/* harmony export */ });\nconst DIR = 'assets/refresh-cl/';\nconst EDGE_LENGTH_MAIN = 100;\nconst EDGE_LENGTH_SUB = 50;\nconst getNetworkOptions = () => ({\n  autoResize: true,\n  height: '100%',\n  width: '100%',\n  nodes: {\n    font: {\n      color: \"#595959\",\n      size: 5\n    }\n  },\n  edges: {\n    smooth: false,\n    //是否显示方向箭头\n    color: \"#c8c8c8\" // 线条颜色\n  },\n  layout: {\n    improvedLayout: false\n  },\n  interaction: {\n    navigationButtons: false,\n    // 如果为真，则在网络画布上绘制导航按钮。这些是HTML按钮，可以使用CSS完全自定义。\n    keyboard: {\n      enabled: false\n    } // 启用键盘快捷键\n  },\n  physics: {\n    enabled: true,\n    solver: \"barnesHut\",\n    barnesHut: {\n      gravitationalConstant: -4000,\n      centralGravity: 0.3,\n      springLength: 120,\n      springConstant: 0.04,\n      damping: 0.09,\n      avoidOverlap: 0.2\n    }\n  },\n  interaction: {\n    hover: true\n  }\n});\n\n//# sourceURL=webpack://network-topology/./src/js/renderer/config/networkConfig.js?");

/***/ }),

/***/ "./src/js/renderer/handlers/dataHandlers.js":
/*!**************************************************!*\
  !*** ./src/js/renderer/handlers/dataHandlers.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   addNodeWithChildren: () => (/* binding */ addNodeWithChildren),\n/* harmony export */   handleEdgeNode: () => (/* binding */ handleEdgeNode)\n/* harmony export */ });\n/* harmony import */ var _utils_state_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/state.js */ \"./src/js/renderer/utils/state.js\");\n/* harmony import */ var _config_networkConfig_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config/networkConfig.js */ \"./src/js/renderer/config/networkConfig.js\");\n\n\n// 递归添加节点\nconst addNodeWithChildren = (node, data, parentId = null) => {\n  // ...原有addNodeWithChildren实现...\n  // 注意将nodes/edges作为参数传入\n  // 生成当前节点ID并存储映射\n  const currentNodeId = _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.incrementId();\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.nodes.add({\n    id: currentNodeId,\n    label: node.node_id,\n    node_type: node.node_type,\n    state: node.state,\n    fqdn: node.fqdn,\n    reverse_dns: node.reverse_dns,\n    mac_address: node.mac_address,\n    vendor: node.vendor,\n    open_ports: node.open_ports,\n    os: node.os,\n    children: node.children,\n    shape: \"circle\",\n    color: {\n      background: \"#F0E68C\",\n      border: \"#B8860B\",\n      highlight: {\n        background: \"#FFD700\",\n        border: \"#DAA520\"\n      },\n      hover: {\n        background: \"#FFD700\",\n        border: \"#8B7500\"\n      }\n    },\n    shadow: {\n      enabled: true,\n      color: \"rgba(0, 0, 0, 0.5)\",\n      size: 10,\n      x: 5,\n      y: 5\n    },\n    opacity: 1\n    // title: generateNodeTile(node),\n  });\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.ipToId[node.node_id] = currentNodeId;\n\n  // 连接到父节点\n  if (parentId !== null) {\n    edges.add({\n      from: parentId,\n      to: currentNodeId,\n      length: _config_networkConfig_js__WEBPACK_IMPORTED_MODULE_1__.EDGE_LENGTH_MAIN,\n      color: '#808080'\n    });\n  }\n\n  // 递归处理子节点\n  if (node.node_type === 'subnet' && node.children) {\n    node.children.forEach(childId => {\n      // 在数据中查找对应的子节点对象\n      const childNode = data.nodes.find(n => n.node_id === childId);\n      if (childNode) {\n        // 如果找到子节点定义，递归处理\n        addNodeWithChildren(childNode, data, currentNodeId);\n      } else {\n        // 未找到时创建占位节点\n        console.warn(`子节点 ${childId} 未定义，创建占位节点`);\n        addNodeWithChildren({\n          node_id: childId,\n          node_type: 'unknown',\n          state: 'down'\n        }, data, currentNodeId);\n      }\n    });\n  }\n};\n\n// 处理边节点\nconst handleEdgeNode = nodeId => {\n  // ...原有handleEdgeNode实现...\n  // 注意将nodes/edges作为参数传入\n\n  if (!_utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.ipToId[nodeId]) {\n    // 尝试在原始数据中查找节点定义\n    const originalNode = data.nodes.find(n => n.node_id === nodeId);\n    if (originalNode) {\n      // 如果找到未处理的节点，完整添加\n      addNodeWithChildren(originalNode, data, nodeId);\n      return _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.ipToId[nodeId];\n    } else {\n      // 创建自动生成的节点\n      const newId = _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.incrementId();\n      _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.nodes.add({\n        id: newId,\n        label: nodeId,\n        node_type: 'auto',\n        shape: \"circle\",\n        color: {\n          background: \"#E0FFFF\",\n          border: \"#4682B4\",\n          highlight: {\n            background: \"#AFEEEE\",\n            border: \"#5F9EA0\"\n          },\n          hover: {\n            background: \"#AFEEEE\",\n            border: \"#5F9EA0\"\n          }\n        },\n        title: `自动生成节点: ${nodeId}`\n      });\n      _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.ipToId[nodeId] = newId;\n      return newId;\n    }\n  }\n  return _utils_state_js__WEBPACK_IMPORTED_MODULE_0__.appState.ipToId[nodeId];\n};\n\n//# sourceURL=webpack://network-topology/./src/js/renderer/handlers/dataHandlers.js?");

/***/ }),

/***/ "./src/js/renderer/handlers/eventHandlers.js":
/*!***************************************************!*\
  !*** ./src/js/renderer/handlers/eventHandlers.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   setupNetworkEvents: () => (/* binding */ setupNetworkEvents)\n/* harmony export */ });\n/* harmony import */ var _config_networkConfig_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/networkConfig.js */ \"./src/js/renderer/config/networkConfig.js\");\n/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils.js */ \"./src/js/renderer/utils/utils.js\");\n/* harmony import */ var _utils_state_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/state.js */ \"./src/js/renderer/utils/state.js\");\n\n\n\nconst setupNetworkEvents = filePath => {\n  var stabilizedTimer;\n  var hoveredNodeId = null;\n\n  //动画稳定后的处理事件\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"stabilized\", function () {\n    clearTimeout(stabilizedTimer);\n    stabilizedTimer = setTimeout(() => {\n      var options = (0,_config_networkConfig_js__WEBPACK_IMPORTED_MODULE_0__.getNetworkOptions)();\n      options.physics.enabled = false; // 关闭物理系统\n      _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.setOptions(options);\n      // network.fit({ animation: true });\n    }, 300);\n  });\n\n  // 右键点击事件处理\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"oncontext\", function (params) {\n    params.event.preventDefault();\n    const menu = document.getElementById('nodeContextMenu');\n    menu.style.display = 'none';\n    // 右键点击的是节点\n    if (hoveredNodeId != null) {\n      // console.log(\"被右键了\");\n      const node = _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.nodes.get(hoveredNodeId);\n      // 更新菜单位置\n      menu.style.display = 'block';\n      menu.style.left = `${params.event.pageX}px`;\n      menu.style.top = `${params.event.pageY}px`;\n      // 查看详情\n      document.getElementById('viewDetails').onclick = () => {\n        const detailContent = `\n\t\t\t  <h4>节点详情</h4>\n\t\t\t  <p>IP地址: ${node.label}</p>\n\t\t\t  <p>状态: ${node.state === 'up' ? '✅ 在线' : '❌ 离线'}</p>\n\t\t\t  <p>操作系统: ${node.os || '未知'}</p>\n\t\t\t  <p>MAC地址: ${node.mac_address || '未获取'}</p>\n\t\t\t  <p>开放端口: ${Array.isArray(node.open_ports) ? node.open_ports.map(p => p.port).join(', ') : typeof node.open_ports === 'object' ? node.open_ports.port : node.open_ports}</p>\n\t\t\t`;\n        Swal.fire({\n          title: '节点信息',\n          html: detailContent,\n          confirmButtonText: '关闭',\n          width: '600px'\n        });\n        menu.style.display = 'none';\n      };\n      document.getElementById('modifyNode').onclick = () => {\n        Swal.fire({\n          title: '修改节点信息',\n          html: `\n\t\t\t\t\t<input id=\"swal-ip\" class=\"swal2-input\" placeholder=\"IP地址\" value=\"${node.label}\">\n\t\t\t\t\t<select id=\"swal-status\" class=\"swal2-select\">\n\t\t\t\t\t  <option value=\"up\" ${node.state === 'up' ? 'selected' : ''}>在线</option>\n\t\t\t\t\t  <option value=\"down\" ${node.state === 'down' ? 'selected' : ''}>离线</option>\n\t\t\t\t\t</select>\n\t\t\t\t\t<input id=\"swal-os\" class=\"swal2-input\" placeholder=\"操作系统\" value=\"${node.os || ''}\">\n\t\t\t\t\t<input id=\"swal-ports\" class=\"swal2-input\" \n\t\t\t\t\t\t   placeholder=\"开放端口 (格式: 端口/协议, 如 80/http)\" \n\t\t\t\t\t\t   value=\"${Array.isArray(node.open_ports) ? node.open_ports.map(p => `${p.port}${p.protocol ? '/' + p.protocol : ''}`).join(', ') : ''}\">\n\t\t\t\t  `,\n          focusConfirm: false,\n          preConfirm: () => {\n            const originalPorts = node.open_ports || [];\n            const inputPorts = document.getElementById('swal-ports').value.split(',').map(entry => {\n              const trimmed = entry.trim();\n              if (!trimmed) return null;\n              const [portStr, protocol = \"tcp\"] = trimmed.split('/');\n              const port = parseInt(portStr, 10);\n              return isNaN(port) ? null : {\n                port,\n                protocol: protocol.trim()\n              };\n            }).filter(Boolean);\n            if (inputPorts.length === 0) {\n              Swal.showValidationMessage('端口不能为空');\n              return false;\n            }\n            const processedPorts = inputPorts.map(({\n              port,\n              protocol\n            }) => {\n              const existingPort = originalPorts.find(p => p.port === port);\n              return existingPort ? {\n                ...existingPort,\n                protocol\n              } : {\n                port,\n                protocol,\n                service: \"unknown\",\n                version: \"\"\n              };\n            });\n            return {\n              label: document.getElementById('swal-ip').value,\n              status: document.getElementById('swal-status').value,\n              os: document.getElementById('swal-os').value,\n              ports: processedPorts\n            };\n          }\n        }).then(result => {\n          if (result.isConfirmed) {\n            const data = result.value;\n            _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.nodes.update({\n              id: hoveredNodeId,\n              label: data.label,\n              state: data.status,\n              os: data.os,\n              open_ports: data.ports,\n              color: data.status === 'up' ? {\n                background: \"#F0E68C\",\n                border: \"#B8860B\"\n              } : {\n                background: \"#D3D3D3\",\n                border: \"#808080\"\n              }\n            });\n            _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.redraw();\n            (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.autoSaveToJSON)(filePath);\n          }\n        });\n        menu.style.display = 'none';\n      };\n\n      // 删除节点\n      document.getElementById('deleteNode').onclick = () => {\n        Swal.fire({\n          title: '确认删除节点？',\n          text: \"该操作将同时删除所有关联的连接！\",\n          icon: 'warning',\n          showCancelButton: true,\n          confirmButtonColor: '#d33',\n          cancelButtonColor: '#3085d6',\n          confirmButtonText: '确认删除'\n        }).then(result => {\n          if (result.isConfirmed) {\n            // 获取所有关联的边\n            const connectedEdges = _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.getConnectedEdges(hoveredNodeId);\n\n            // 删除节点和关联的边\n            _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.nodes.remove(hoveredNodeId);\n            _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.edges.remove(connectedEdges);\n\n            // 刷新网络\n            _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.redraw();\n            (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_1__.autoSaveToJSON)(filePath);\n          }\n        });\n        menu.style.display = 'none';\n      };\n    }\n  });\n\n  // 点击页面其他地方关闭菜单\n  document.addEventListener('click', e => {\n    if (!e.target.closest('.custom-context-menu')) {\n      document.getElementById('nodeContextMenu').style.display = 'none';\n    }\n  });\n\n  //选中节点\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"selectNode\", function (params) {});\n\n  //单击节点\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"click\", function (params) {});\n\n  //拖动节点\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"dragging\", function (params) {});\n\n  //拖动结束后\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"dragEnd\", function (params) {});\n\n  // 缩放\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"zoom\", function (params) {});\n\n  // 监听鼠标悬停节点事件\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"hoverNode\", params => {\n    hoveredNodeId = params.node;\n  });\n\n  // 监听鼠标离开节点事件\n  _utils_state_js__WEBPACK_IMPORTED_MODULE_2__.appState.network.on(\"blurNode\", () => {\n    hoveredNodeId = null;\n  });\n};\n\n//# sourceURL=webpack://network-topology/./src/js/renderer/handlers/eventHandlers.js?");

/***/ }),

/***/ "./src/js/renderer/mainControl.js":
/*!****************************************!*\
  !*** ./src/js/renderer/mainControl.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _handlers_dataHandlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers/dataHandlers.js */ \"./src/js/renderer/handlers/dataHandlers.js\");\n/* harmony import */ var _config_networkConfig_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config/networkConfig.js */ \"./src/js/renderer/config/networkConfig.js\");\n/* harmony import */ var _handlers_eventHandlers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./handlers/eventHandlers.js */ \"./src/js/renderer/handlers/eventHandlers.js\");\n/* harmony import */ var _utils_state_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/state.js */ \"./src/js/renderer/utils/state.js\");\n\n\n\n\n\n// Electron文件打开事件\nwindow.api.onFilePath(async filePath => {\n  try {\n    // ...文件读取逻辑...\n    const content = await window.api.readFile(filePath);\n    console.log(\"filepath:\", filePath);\n    const data = JSON.parse(content);\n    _utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.nodes.clear();\n    _utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.edges.clear();\n    let idCounter = 1; // 重置ID计数器\n    // 使用模块化函数\n    data.nodes.forEach(node => (0,_handlers_dataHandlers_js__WEBPACK_IMPORTED_MODULE_0__.addNodeWithChildren)(node, data));\n    data.edges.forEach(edge => {\n      const fromId = (0,_handlers_dataHandlers_js__WEBPACK_IMPORTED_MODULE_0__.handleEdgeNode)(edge.from_node, data);\n      const toId = (0,_handlers_dataHandlers_js__WEBPACK_IMPORTED_MODULE_0__.handleEdgeNode)(edge.to_node, data);\n      _utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.edges.add({\n        from: fromId,\n        to: toId,\n        length: _config_networkConfig_js__WEBPACK_IMPORTED_MODULE_1__.EDGE_LENGTH_MAIN,\n        edge_type: edge.edge_type,\n        protocol: edge.protocol,\n        layer: edge.layer,\n        color: 'black',\n        dashes: !_utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.ipToId[edge.from_node] || !_utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.ipToId[edge.to_node] // 虚线表示包含自动创建的节点\n      });\n    });\n    var container = document.getElementById('mynetwork'); // 网络图容器\n    // 初始化网络\n    _utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.network = new vis.Network(container, {\n      nodes: _utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.nodes,\n      edges: _utils_state_js__WEBPACK_IMPORTED_MODULE_3__.appState.edges\n    }, (0,_config_networkConfig_js__WEBPACK_IMPORTED_MODULE_1__.getNetworkOptions)());\n\n    // 设置事件监听\n    (0,_handlers_eventHandlers_js__WEBPACK_IMPORTED_MODULE_2__.setupNetworkEvents)(filePath);\n  } catch (error) {\n    console.error('文件处理失败:', error);\n  }\n});\n\n//# sourceURL=webpack://network-topology/./src/js/renderer/mainControl.js?");

/***/ }),

/***/ "./src/js/renderer/utils/state.js":
/*!****************************************!*\
  !*** ./src/js/renderer/utils/state.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   appState: () => (/* binding */ appState)\n/* harmony export */ });\nconst appState = {\n  idCounter: 1,\n  nodes: new vis.DataSet(),\n  edges: new vis.DataSet(),\n  ipToId: {},\n  network: null,\n  // 提供自增方法\n  incrementId() {\n    return this.idCounter++;\n  }\n};\n\n//# sourceURL=webpack://network-topology/./src/js/renderer/utils/state.js?");

/***/ }),

/***/ "./src/js/renderer/utils/utils.js":
/*!****************************************!*\
  !*** ./src/js/renderer/utils/utils.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   autoSaveToJSON: () => (/* binding */ autoSaveToJSON),\n/* harmony export */   generateNodeTile: () => (/* binding */ generateNodeTile),\n/* harmony export */   parsePorts: () => (/* binding */ parsePorts)\n/* harmony export */ });\n/* harmony import */ var _state_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./state.js */ \"./src/js/renderer/utils/state.js\");\n\n// 处理端口信息格式化\nconst parsePorts = ports => {\n  if (!ports) return '无'; // 字段不存在\n  if (typeof ports === 'number') return ports; // 单个端口号（数字）\n  if (typeof ports === 'string') return ports; // 字符串格式的端口（如 \"80,443\"）\n\n  // 如果是数组\n  if (Array.isArray(ports)) {\n    // 提取对象中的 port 字段（如果元素是对象）\n    const portList = ports.map(item => {\n      if (typeof item === 'object' && item.port !== undefined) {\n        return item.port; // 从对象中提取端口号\n      }\n      return item; // 直接是数字或字符串\n    });\n    return portList.join(', ') || '无';\n  }\n  return '无'; // 其他未知类型\n};\n\n// 生成节点信息卡片\nconst generateNodeTile = node => {\n  // 深度处理 open_ports 字段\n  return `\n\t  <div style=\"padding:15px;\">\n\t\t<h5 style=\"margin-bottom:10px;\">IP(${node.node_id || '未知'})</h5>\n\t\t<h5 style=\"margin-bottom:10px;\">\n\t\t  状态：<span title=\"${node.state || '未知'}\">\n\t\t\t${node.state === 'up' ? '✅ 在线' : '❌ 离线'}\n\t\t  </span>\n\t\t</h5>\n\t\t<h5 style=\"margin-bottom:10px;\">操作系统：${node.os || '未知'}</h5>\n\t\t<h5 style=\"margin-bottom:10px;\">\n\t\t  开放端口：${parsePorts(node.open_ports)}\n\t\t</h5>\n\t\t<h5>MAC：${node.mac_address || '未知'}</h5>\n\t  </div>\n\t`;\n};\n\n// 自动保存功能\nconst autoSaveToJSON = filePath => {\n  const updatedData = {\n    nodes: _state_js__WEBPACK_IMPORTED_MODULE_0__.appState.nodes.get().map(node => ({\n      node_id: node.label,\n      node_type: node.node_type,\n      state: node.state,\n      fqdn: node.fqdn,\n      reverse_dns: node.reverse_dns,\n      mac_address: node.mac_address,\n      vendor: node.vendor,\n      open_ports: node.open_ports,\n      os: node.os\n    })),\n    edges: _state_js__WEBPACK_IMPORTED_MODULE_0__.appState.edges.get().map(edge => ({\n      from_node: _state_js__WEBPACK_IMPORTED_MODULE_0__.appState.nodes.get(edge.from).label,\n      to_node: _state_js__WEBPACK_IMPORTED_MODULE_0__.appState.nodes.get(edge.to).label,\n      edge_type: edge.edge_type,\n      protocol: edge.protocol,\n      layer: edge.layer\n    }))\n  };\n  window.api.writeFile(filePath, JSON.stringify(updatedData, null, 2));\n};\n\n//# sourceURL=webpack://network-topology/./src/js/renderer/utils/utils.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/renderer/mainControl.js");
/******/ 	
/******/ })()
;
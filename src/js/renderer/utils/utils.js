import { appState } from './state.js';
// 处理端口信息格式化
export const parsePorts = (ports) => {
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

// 生成节点信息卡片
export const generateNodeTile = (node) => {
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

// 自动保存功能
export const autoSaveToJSON = (filePath) => {
    const updatedData = {
        nodes: appState.nodes.get().map(node => ({
            node_id: node.label,
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
        })),
        edges: appState.edges.get().map(edge => ({
            from_node: appState.nodes.get(edge.from).label,
            to_node: appState.nodes.get(edge.to).label,
            edge_type: edge.edge_type,
            protocol: edge.protocol,
            layer: edge.layer
        }))
    };
    window.api.writeFile(filePath, JSON.stringify(updatedData, null, 2));
};
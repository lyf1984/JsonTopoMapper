export const DIR = 'assets/refresh-cl/';
export const EDGE_LENGTH_MAIN = 100;
export const EDGE_LENGTH_SUB = 50;

export const getNetworkOptions = () => ({
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
        color: "#c8c8c8",
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
});

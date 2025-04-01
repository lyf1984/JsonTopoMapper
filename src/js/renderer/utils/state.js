export const appState = {
    idCounter: 1,
    nodes: new vis.DataSet(),
    edges: new vis.DataSet(),
    ipToId: new Map(),
    network: null,
    
    // 提供自增方法
    incrementId() {
      return this.idCounter++;
    }
  };
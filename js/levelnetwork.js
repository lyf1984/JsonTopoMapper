    var container = document.getElementById('mylevelnetwork');
    var options;
	
	var nodes = [];
    var edges = [];
    var network = null;

    var DIR = 'assets/refresh-cl/';
    var EDGE_LENGTH_MAIN = 100;
    var EDGE_LENGTH_SUB = 50;
	var clickHiddenNodeSet = null;
	var filterHiddenNodeSet = null;
	var aloneNodeList = [];
	var nodesVis = null;
	var edgesVis = null;
	  
	  nodeTile = '<div style="padding:15px;"><h5 style="margin-bottom:10px;">电表B1-2-2-005(900010002138)</h5><h5 style="display:inline-block;margin-bottom:10px;">监测状态：<span class="badge bg-urgent">0</span><span class="badge bg-main">1</span><span class="badge bg-second">47</span><span class="badge bg-normal">7</span></h5>'
	  +'<h5 style="margin-bottom:10px;">电压：20V</h5><h5 style="margin-bottom:10px;">电流：20A</h5><h5>线损：10%</h5></div>';
	  nodes.push({id: 2, label: '智能网关1',image: DIR + '智能网关.png', shape: 'image', opacity: 1,title:nodeTile,shadow:{enabled: true,color: 'rgba(255,0,0,0.5)',size:18,x:0,y:0},level:1})
      nodes.push({id: 3, label: '集中器2', image: DIR + '集中器.png', shape: 'image',title:nodeTile,level:2});
      edges.push({from: 2, to: 3, length: EDGE_LENGTH_MAIN,color:'red'});
      edges.push({from: 1, to: 3, length: EDGE_LENGTH_MAIN});
	  
	  nodes.push({id: 4, label: '断路器1', image: DIR + '断路器.png', shape: 'image', group: 'computer', opacity: 1,title:nodeTile,level:3});
	  edges.push({from: 3, to: 4, length: EDGE_LENGTH_MAIN});
	  
	  nodes.push({id: 5, label: '智能表箱1', image: DIR + '表箱.png', shape: 'image', opacity: 1,title:nodeTile,level:4});
	  nodes.push({id: 6, label: '智能表箱2', image: DIR + '表箱.png', shape: 'image', opacity: 1,title:nodeTile,level:4});
	  nodes.push({id: 7, label: '智能电表1', image: DIR + '电表.png', shape: 'image', opacity: 1,title:nodeTile,level:4});
	  edges.push({from: 4, to: 5, length: EDGE_LENGTH_MAIN});
	  edges.push({from: 4, to: 6, length: EDGE_LENGTH_MAIN});
	  edges.push({from: 4, to: 7, length: EDGE_LENGTH_MAIN});
	  
	  nodes.push({id: 8, label: '智能电表2', image: DIR + '电表.png', shape: 'image', group: 'computer', opacity: 1,title:nodeTile,level:5});
	  nodes.push({id: 9, label: '智能电表3', image: DIR + '电表.png', shape: 'image', opacity: 1,title:nodeTile,level:5});
	  nodes.push({id: 10, label: '智能电表4', image: DIR + '电表.png', shape: 'image', opacity: 1,title:nodeTile,level:5});
	  edges.push({from: 5, to: 8, length: EDGE_LENGTH_MAIN});
	  edges.push({from: 5, to: 9, length: EDGE_LENGTH_MAIN});
	  edges.push({from: 5, to: 10, length: EDGE_LENGTH_MAIN});
	  var j = 5;
      for (var i = 11; i <= 18; i++) {
        nodes.push({id: i, label: '智能电表'+j, image: DIR + '电表.png', shape: 'image', group: 'computer', opacity: 1,title:nodeTile,level:5});
        edges.push({from: 6, to: i, length: EDGE_LENGTH_SUB});
		j++;
      }

      // 单独节点
	  nodes.push({id: 19, label: '智能电表'+11, image: DIR + '电表.png', shape: 'image', group: 'computer', opacity: 1,title:nodeTile,level:0});
	  nodes.push({id: 20, label: '断路器4', image: DIR + '断路器.png', shape: 'image', group: 'computer', opacity: 1,title:nodeTile,level:0});
      var options = {
		autoResize: true,
		height: '100%',
		width: '100%',
		  nodes : {
				  font:{
					  color: "#595959",
					  size: 13
				  }
			  },
			  edges: {
				  smooth: {
					type: 'cubicBezier',
					forceDirection: 'vertical',//['horizontal', 'vertical', 'none']
					roundness: 1,
				},
				  color: "#c8c8c8" // 线条颜色
			  },
			  layout: {
				hierarchical:{
					enabled:true,
					direction:'UD',
					sortMethod:'directed',//hubsize 将边最多的节点放在顶部。 由此计算层次布局的其余部分。directed根据边的“to”和“from”数据计算层级。A->B，因此B低于A的层级
					edgeMinimization: false,
					blockShifting:false,
					nodeSpacing:80,
				}
			  },
			  physics: {
				  stabilization: false,
				  barnesHut: {
					theta: 0.2,//合并的远程力和各个短程力之间的边界较高的值会更快，但是会产生更多的错误，较低的值会很慢，但是会减少错误
					  centralGravity: 0.3, // 中心重力吸引器将整个网络拉回中心
					  springLength: 80, // 边缘被建模为弹簧。这个弹簧长度是弹簧的剩余长度
					  gravitationalConstant: -80000, // 重力吸引。我们喜欢排斥 所以价值是负数。如果你想要排斥力更强，减小值（所以-10000，-50000）。
					  avoidOverlap: 1, // 接受范围：[0 .. 1]。当大于0时，会考虑节点的大小。该距离将由重力模型的节点的包围圆的半径计算。值1是最大重叠避免。
					  damping: 1,//*弹簧抖动 值越小则抖动越厉害
					  springConstant: 0.5
				  },
				timestep: 0.1,//如果您在网络中看到大量的抖动，可以稍微降低这个值。
				minVelocity: 5 // 一旦达到所有节点的最小速度，我们假设网络已经稳定，仿真停止。 值越大停止的越早
			  },
			interaction: {
				hover: true
			},
	  };
	  nodesVis = new vis.DataSet(nodes);
	  edgesVis = new vis.DataSet(edges);
	  clickHiddenNodeSet = new vis.DataSet([]);
	  filterHiddenNodeSet = new vis.DataSet([]);
	  //初始化数据时筛选出没有连线的节点---start
	  var showNode = [];
	  edgesVis.forEach(function(edge){//记录有边的节点
	  	if($.inArray(edge.from,showNode)==-1){
	  		showNode.push(edge.from);
	  	}
		if($.inArray(edge.to,showNode)==-1){
			showNode.push(edge.to);
		}
	  });
	  
	  nodesVis.getIds({//把没边的节点赋值给filterHiddenNodeSet并把没边的节点隐藏
		  filter: function(node) {
			  if($.inArray(node.id,showNode)==-1){
				var node = nodesVis.get(node.id);
				node.shadow = {enabled: true,color: 'rgba(0,0,0,0.5)',size:10,x:0,y:0};
			  	filterHiddenNodeSet.add(node);
				node.hidden = true;
				nodesVis.update(node);
			  }
		  }
	  });
	  //初始化数据时筛选出没有连线的节点---end
    function draw() {
		var data = {
		  nodes: nodesVis,
		  edges: edgesVis
		};
      network = new vis.Network(container, data, options);
	  var num = 1;
	  filterHiddenNodeSet.getIds({//在绘制大图之后添加独立设备节点否则会被清空
		  filter: function(node) {
			  var divRight = parseInt(Math.random()*($('#mylevelnetwork').innerWidth()-parseInt($('#mylevelnetwork').innerWidth()/1.5)-80+1),10);
			  var divTop = parseInt(Math.random()*($('#mylevelnetwork').innerHeight()-parseInt($('#mylevelnetwork').innerHeight()/2)-80+1),10);
			  $('#mylevelnetwork').append('<div style="position: absolute;right: '+divRight+'px;top: '+divTop+'px;height: 80px;width: 80px;visibility:hidden" id="newDom'+num+'" class="newDom"></div>');
			  var alonedata = {
				nodes: [node],
				edges: [],
			  };
			  var newnetwork = new vis.Network(document.getElementById('newDom'+num), alonedata, {interaction:{dragNodes:false,dragView:false,hover:false}});//
			  newnetwork.on("hoverNode", function (params) {});
			  newnetwork.on("stabilized", function (params) {
			  	setTimeout(function(){
			  	   newnetwork.fit();
			  	},50);
			  });
			  newnetwork.on("doubleClick",function(params){
				  if(params.nodes[0]){//如果点击的是节点
				  	
				  }else{
					  
				  }
			  })
			  aloneNodeList.push(newnetwork);
			  num++;
		  }
	  });
	  //动画稳定后的处理事件
        var stabilizedTimer;
        network.on("stabilized", function (params) { // 会调用两次？
			exportNetworkPosition(network);
			
            window.clearTimeout(stabilizedTimer);
            stabilizedTimer = setTimeout(function(){
               options.physics.enabled = false; // 关闭物理系统
               network.setOptions(options);
               network.fit({animation:true});
            },100);
        });


        //选中节点
        network.on("selectNode", function (params) {
			
		});
		var clickTimer=null;//双击与单击事件区分
        //单击节点
        network.on("click", function (params) {
			clearTimeout(clickTimer);
			clickTimer = setTimeout(function(){
				var tempEdgeSet = new vis.DataSet([]);
				tempEdgeSet.add(edgesVis.get());
				var ergodicNode = [];//需要遍历的节点
				if(params.nodes[0]){//如果点击的是节点
					ergodicNode.push(params.nodes[0]);
					function ergodicNodeToHide(){//如果有子节点则更新ergodicNode
						var newErgodicNode = []
						tempEdgeSet.forEach(function(edge){
							if($.inArray(edge.from,ergodicNode)>-1){//点击的节点是有子节点的
								var nodeId = edge.to;
								if(ergodicNode[0] == params.nodes[0]){//如果是点击的下一层节点
									if(clickHiddenNodeSet.get(nodeId)){//如果该节点是隐藏的则显示
										var node = clickHiddenNodeSet.get(nodeId);
										clickHiddenNodeSet.remove(nodeId);
										nodesVis.add(node);
									}else{//如果该节点是显示的则隐藏
										var node = nodesVis.get(nodeId);
										nodesVis.remove(nodeId);
										clickHiddenNodeSet.add(node);
										newErgodicNode.push(nodeId);
									}
								}else{//如果是下多层节点
									if(clickHiddenNodeSet.get(edge.from)&&!clickHiddenNodeSet.get(nodeId)){//父节点为隐藏且子节点没有隐藏则隐藏
										var node = nodesVis.get(nodeId);
										nodesVis.remove(nodeId);
										clickHiddenNodeSet.add(node);
										newErgodicNode.push(nodeId);
									}else{//父节点为显示
										
									}
								}
							}else{//点击的节点没有子节点
								// console.log('没有子节点')
							}
						});
						if(newErgodicNode.length>0){
							ergodicNode = newErgodicNode;
							ergodicNodeToHide();
						}else{
							network.redraw();
							return;
						}
					}
					ergodicNodeToHide();
				}
			},200)
		});

        //双击节点 隐藏或者显示子节点
        network.on("doubleClick", function (params) {
			//双击节点跳转页面start
			clearTimeout(clickTimer);
			if(params.nodes[0]){//如果点击的是节点
				
			}else{
				
			}
			
        });

        //拖动节点
        network.on("dragging", function (params) {//拖动进行中事件
            if (params.nodes.length != 0 ) {
                nodeMoveFun(params);
            }
        });

        //拖动结束后
        network.on("dragEnd", function (params) {
            if (params.nodes.length != 0 ) {
                var arr = nodeMoveFun(params);
                exportNetworkPosition(network,arr);
            }
        });

        // 缩放
        network.on("zoom", function (params) {});
		network.on("hoverNode",function(params){
			
		})
		
    }

    $(function (){
		//显示过滤设备
		$('#showFilterDevice').change(function(){
			if($('#showFilterDevice').is(':checked')){
				$('.newDom').css({'visibility':'visible'});
			}else{
				$('.newDom').css({'visibility':'hidden'});
			}
		})
		draw();
		var dragging = false;
		var iX, iY, targetDom;
		$(".newDom").mousedown(function(e) {
			 dragging = true;
			 iX = e.clientX - this.offsetLeft;
			 iY = e.clientY - this.offsetTop;
			 targetDom = e.currentTarget;
			 this.setCapture && this.setCapture();
			 return false;
		 });
	
		 $("#mylevelnetwork").mousemove(function(e){
			if (dragging) {
				 var e = e || window.event;
				 var oX = e.clientX - iX;
				 var oY = e.clientY - iY;
				 $(targetDom).css({
					 "left": oX + "px",
					 "top": oY + "px"
				 });
				 return false;
			}
		});
		 $(".newDom").mouseup(function(e) {
			 dragging = false;
			 this.releaseCapture && this.releaseCapture();
			 e.cancelBubble = true;
		 })
		 //hover唤醒——待完善
		 // $(".newDom").hover(function(e) {
			//  var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			//  $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 // })
		 // $(".newDom").mousemove(function(e) {
			//  var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			//  $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'block'})
		 // })
		 // $(".newDom").mouseout(function(e) {
			//  var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			//  $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 // })
		 // $(".newDom").mouseenter(function(e) {
			//  console.log("mouseenter")
			//  var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			//  $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 // })
		 // $(".newDom").mouseover(function(e) {
			//  console.log("mouseover")
			//  var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			//  $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 // })
		 //click唤醒-待完善
		 // $(".newDom div").mouseenter(function(){event.stopPropgation();});
		 // $(".newDom div").hover(function(){event.stopPropgation();});
		 // $(".newDom div").mouseover(function(){event.stopPropgation();});
		 // $(".newDom div").mousemove(function(){event.stopPropgation();});
		 $(".newDom").mouseenter(function(e) {
			 var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			 $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 })
		 $(".newDom").mouseout(function(e) {
			 var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			 $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 })
		 $(".newDom").hover(function(e) {
			 var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			 $(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 })
		 $(".newDom").mousemove(function(e) {
			var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
			$(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'none'})
		 })
		 $(".newDom").on('click',function(e){
			 setTimeout(function(){
				var targetTool = $(e.currentTarget).children('.vis-network').children('.vis-tooltip')
				$(targetTool).css({'position':'fixed','left':e.pageX+'px','top':e.pageY+'px','display':'block'})
			 },300);
		 })
    });

    /*
     *获取所有子节点
     * network ：图形对象
     * _thisNode ：单击的节点（父节点）
     * _Allnodes ：用来装子节点ID的数组
     * */
    function getAllChilds(network,_thisNode,_Allnodes){
        var _nodes = network.getConnectedNodes(_thisNode,"to");
        if(_nodes.length > 0){
            for(var i=0;i<_nodes.length;i++){
                getAllChilds(network,_nodes[i],_Allnodes);
                _Allnodes.push(_nodes[i]);
            }
        }
        return _Allnodes
    };

    // 节点移动
    function nodeMoveFun(params){
        var click_node_id = params.nodes[0];
        var allsubidsarr = getAllChilds(network,click_node_id,[]); // 获取所有的子节点

        if(allsubidsarr){ // 如果存在子节点
            var positionThis = network.getPositions(click_node_id);
            var clickNodePosition = positionThis[click_node_id]; // 记录拖动后，被拖动节点的位置
            var position = JSON.parse(localStorage.getItem("position"));
            var startNodeX,startNodeY; // 记录被拖动节点的子节点，拖动前的位置
            var numNetx,numNety; // 记录被拖动节点移动的相对距离
            var positionObj={}; // 记录移动的节点位置信息， 用于返回

            positionObj[click_node_id] =  {x:clickNodePosition.x, y:clickNodePosition.y}; // 记录被拖动节点位置信息
            numNetx = clickNodePosition.x - position[click_node_id].x; // 拖动的距离
            numNety = clickNodePosition.y - position[click_node_id].y;

            for(var j =0;j<allsubidsarr.length;j++){
                if(position[allsubidsarr[j]]) {
                    startNodeX = position[allsubidsarr[j]].x; // 子节点开始的位置
                    startNodeY = position[allsubidsarr[j]].y;
                    network.moveNode(allsubidsarr[j], (startNodeX + numNetx), (startNodeY + numNety)); // 在视图上移动子节点
                    positionObj[allsubidsarr[j]] =  {x:(startNodeX + numNetx), y:(startNodeY + numNety)}; // 记录子节点位置信息
                }
            }
        }
        return positionObj;
    };

    /*
     *节点位置设置
     * network ：图形对象
     * arr ：本次移动的节点位置信息
     * */
    function exportNetworkPosition(network,arr){
        if(arr){ // 折叠过后  getPositions() 获取的位置信息里不包含隐藏的节点位置信息，这时候调用上次存储的全部节点位置，并修改这次移动的节点位置，最后保存
            var localtionPosition = JSON.parse(localStorage.getItem("position"));
            for(let index in arr ){
                localtionPosition[index] = {
                    x:arr[index].x,
                    y:arr[index].y
                }
            }
            setLocal(localtionPosition);

        }else{
            var position = network.getPositions();
            setLocal(position);
        }
    };
    //处理本地存储，这里仅仅只能作为高级浏览器使用，ie9以下不能处理
    function setLocal(position) {
        localStorage.removeItem("position");
        localStorage.setItem("position",JSON.stringify(position));
    }
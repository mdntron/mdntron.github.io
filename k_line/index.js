// import socket from "./socket";
// import datafeeds from './datafees';
// import {
//   getOverrides,
//   getStudiesOverrides
// } from './overrides';

class TVjsApi {
  constructor(symbol) {
    this.symbol = symbol;
    this.widgets = null; //TODO: tradingview图表
	this.wsurl = 'wss://stream.binance.com:9443/';
    this.socket = new socket(this.wsurl);
	///stream?streams=btcusdt@kline_5m
    // this.socket = new socket('WSS://127.0.0.1:3000');
    this.interval = '5'; //图表周期 
    this.cacheData = {}; //图表缓存数据
    this.resolveSymbolinfo = {}; //币种信息
    this.lastTime = null;
    this.getBarTimer = null;
    this.studies = []; //配置项
    this.isLoading = true; //是否懒加载
     this.socket.doOpen();
    this.timer = null;
    this.locale = 'zh_TW'
    this.skin = 'black'
    this.bg = '#131625'
    this.socket.on('open', () => {
  //     // TODO: 页面初始化后请求币种基本信息
  // //     this.socket.send(JSON.stringify({
  // //       method: 'SUBSCRIBE',
  // //       params: ["btcusdt@kline_1m"],
		// // "id": 1
       
  // //     }));
	  
     });
      this.socket.on('message', this.onMessage.bind(this));
   this.socket.on('close', this.onClose.bind(this));
   this.datafeeds = new datafeeds(this);
  }
  
  /**
   * @description 图表初始化
   */
  init() {
    let resolution = this.interval; //TODO: 图表周期
    let symbol = this.symbol; //币种信息
    if (!this.widgets) {
      this.widgets = new TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: resolution,
        container_id: 'tv_chart_container',
        datafeed: this.datafeeds,
        library_path: 'static/charting_library/',
        timezone: 'Asia/Shanghai',
        timeframe: '1S',
        toolbar_bg: this.bg, //工具栏的背景颜色
        locale: this.locale,
        debug: false,
        theme: 'Dark',
        disabled_features: [
          // 顶部工具栏
          "header_widget",
          //底部时间栏目
          "timeframes_toolbar",
          //k线与销量分开
          "volume_force_overlay"
        ],
        enabled_features: [
          "adaptive_logo",
          "hide_left_toolbar_by_default"
        ],
        overrides: getOverrides(this.skin),
        studies_overrides: getStudiesOverrides(this.skin)
      });
      this.widgets.onChartReady(() => {
        this.createStudy();
      });
    }
  }
  /**
   * @description 创建5、10、30日均线
   */
  createStudy() {
    let thats = this.widgets;
    let id = thats.chart().createStudy('Moving Average', false, false, [5], null, {
      'Plot.color': 'rgb(150, 95, 196)'
    });
    this.studies.push(id);
    id = thats.chart().createStudy('Moving Average', false, false, [10], null, {
      'Plot.color': 'rgb(116,149,187)'
    });
    this.studies.push(id);
    id = thats.chart().createStudy('Moving Average', false, false, [20], null, {
      "plot.color": "rgb(118,32,99)"
    });
    this.studies.push(id);
  }
  /**
   * 
   * @param {皮肤} e 
   */
  changeSkin(type) {
    this.skin = type
    if (this.skin == 'white') {
      this.bg = '#fff'
    } else {
      this.bg = '#131625'
    }
  }
  /**
   * 
   * @param {多语言} e 
   */
  handleLang(lang) {
    this.locale = lang
    this.widgets = null
    this.init()
  }
  /**
   * 
   * @param {币种} e 
   */
   
  handleSymbol(symbol) {
    this.symbol = symbol
    this.widgets = null
    this.init()
  }
  
  /**
   * @description websocket推送信息
   * @param {Object} e
   */
  onMessage(e) {
	 
    switch (e.type) {
      case 'subSymbolinfo': //TODO: 币种信息
      {
        // console.log('币种信息....');
        // console.log(e.data);
      };
      break;
    case 'getBars': //TODO: 获取历史K线数据
    {
		 console.log(e.data);
		let kdata =[];
		for(let i =0;i<e.data.length;i++){
			let barsData = {
				date: e.data[i][0],
				dateEnd: e.data[i][6],
				symbol:this.symbol,
				//period: data[i][0],
				open: parseFloat(e.data[i][1]),
				close: parseFloat(e.data[i][4]),
				high: parseFloat(e.data[i][2]),
				low: parseFloat(e.data[i][3]),
				volume: parseFloat(e.data[i][5]),
				time: e.data[i][0],
				isEnd: false,
				amount: parseFloat(e.data[i][7])
			 
			};
			
			kdata.push(barsData);
			
			
		}
      let data = kdata;
      const ticker = `LongBit${this.symbol}-${this.interval}`; //TODO: LongBitGXC/USDT-15
      const tickerCallback = ticker + "Callback"; //TODO: LongBitGXC/USDT-15Callback
      if (data && data.length) { //TODO: 有数据返回
        let list = []
        const tickerstate = ticker + "state"; //TODO: LongBitGXC/USDT-15state
        const onLoadedCallback = this.cacheData[tickerCallback];
        list = [...list, ...data];
        //如果没有缓存数据，则直接填充，发起订阅
        if (!this.cacheData[ticker]) {
          this.cacheData[ticker] = list;
         this.subscribe(e.resolution); //TODO: 发起订阅
        }
        //新数据即当前时间段需要的数据，直接喂给图表插件
        if (onLoadedCallback) {
          onLoadedCallback(list);
          delete this.cacheData[tickerCallback];
        }
        //请求完成，设置状态为false
        this.cacheData[tickerstate] = !1;
        //记录当前缓存时间，即数组最后一位的时间
        this.lastTime = this.cacheData[ticker][this.cacheData[ticker].length - 1].time;
      } else { //TODO: 无数据返回
        const onLoadedCallback = this.cacheData[tickerCallback];
        if (onLoadedCallback) {
          onLoadedCallback([]);
          delete this.cacheData[tickerCallback];
        }
      }
    };
    break;
   default: //TODO: 订阅后数据
    {
      let data = e.data;
      // this.timer = setTimeout(() => {
      //   this.subscribe()
      // }, 2000)
	  console.log("kline message");
      if (data) {
        const ticker = `LongBit${this.symbol}-${this.interval}`; //TODO: LongBitGXC/BTC-15
       let barsData = {
       	date: e.data["k"]["t"],
       	dateEnd:e.data["k"]["T"],
       	symbol:this.symbol,
       	//period: data[i][0],
       	open: parseFloat(e.data["k"]["o"]),
       	close: parseFloat(e.data["k"]["c"]),
       	high: parseFloat(e.data["k"]["h"]),
       	low: parseFloat(e.data["k"]["l"]),
       	volume: parseFloat(e.data["k"]["v"]),
       	time: e.data["k"]["t"],
       	isEnd: false,
       	amount: parseFloat(e.data["k"]["q"])
        
       };
       
        //TODO: 如果增量更新数据的时间大于缓存时间，而且缓存有数据，数据长度大于0
        if (barsData.time > this.lastTime && this.cacheData[ticker] && this.cacheData[ticker].length) {
          //增量更新的数据直接加入缓存数组
          this.cacheData[ticker].push(barsData);
          // 修改缓存时间
          this.lastTime = barsData.time;
        } else if (barsData.time == this.lastTime && this.cacheData[ticker] && this.cacheData[ticker].length) {
          //如果增量更新的时间等于缓存时间，即在当前时间颗粒内产生了新数据，更新当前数据
          this.cacheData[ticker][this.cacheData[ticker].length - 1] = barsData;
        }
        //TODO: 通知图表插件，可以开始增量更新的渲染了
        this.datafeeds.barsUpdater.updateData();
      }
    };
    break;
   }
  }
  /**
   * @description websocket关闭信息
   */
  onClose() {
    console.log(' >> : 连接已断开... 正在重连')
  }
  /**
   * 发送websocket消息
   * @param {Object} data 
   */
  sendMessage(data) {
	  
    if (this.socket.checkOpen()) { //检验websocket是否打开
      this.socket.send(data);
    } else {
      this.socket.on('open', () => {
        this.socket.send(data);
      });
    }
  }
  /**
   * @description 获取当前交易币种信息
   * @param {String} symbol 币种信息
   */
  getSymbolinfo(symbol) {
	  
    let splitsymbolName = symbol.split('/');
    let tradeAssetId = filtercoin(splitsymbolName[splitsymbolName.length - 2]).asset_id;
    let coreAssetId = filtercoin(splitsymbolName[splitsymbolName.length - 1]).asset_id;
    return {
      coreAssetId,
      tradeAssetId
    };
  }
  /**
   * @description 获取历史K线数据
   * @param {*} symbolInfo 
   * @param {*} resolution 
   * @param {*} rangeStartDate 
   * @param {*} rangeEndDate 
   * @param {*} onLoadedCallback 
   */
  getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {
	 console.log('getBars function ',resolution);
    let ticker = `${symbolInfo.name}-${resolution}`; //TODO: GDEXGDC/GXC-1D
	console.log("ticker",ticker)
    let tickerload = ticker + "load"; //TODO: GDEXGDC/GXC-1Dload
    let tickerstate = ticker + "state"; //TODO: GDEXGDC/GXC-1Dstate
    
    if (!this.cacheData[ticker] && !this.cacheData[tickerstate]) { //TODO: 如果缓存没有数据，而且未发出请求，记录当前节点开始时间
      
     
      this.cacheData[tickerload] = rangeStartDate;
      //发起请求，从websocket获取当前时间段的数据
      this.initMessage(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback);
      //设置状态为true
      this.cacheData[tickerstate] = !0;
      return false;
    }
    // TODO: 获取历史记录
    // if (!this.cacheData[tickerload] || this.cacheData[tickerload] > rangeStartDate) { //TODO: 如果缓存有数据，但是没有当前时间段的数据，更新当前节点时间
    //   this.cacheData[tickerload] = rangeStartDate;
    //   this.initMessage(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback);
    //   this.cacheData[tickerstate] = !0;
    //   return false;
    // }
    if (this.cacheData[tickerstate]) { //TODO: 正在从websocket获取数据，禁止一切操作
      return false;
    }
    ticker = `${symbolInfo.name}-${this.interval}`; //TODO: GDEXGDC/GXC-1D
    // 如果缓存中有当前时间段的数据，构造newBars，调用onLoadedCallback(newBars)。
    if (this.cacheData[ticker] && this.cacheData[ticker].length) {
      this.isLoading = false; //关闭loading
      const newBars = [];
      this.cacheData[ticker].forEach(item => {
        if (item.time >= rangeStartDate * 1000 && item.time <= rangeEndDate * 1000) {
          newBars.push(item);
        }
      });
      onLoadedCallback(newBars);
    } else {
      this.getBarTimer = setTimeout(() => {
        this.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
      }, 1000);
    }
  }
  /**
   * @description 初始化数据
   * @param {*} symbolInfo 
   * @param {*} resolution 
   * @param {*} rangeStartDate 
   * @param {*} rangeEndDate 
   * @param {*} onLoadedCallback 
   */
    initMessage(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {
	  console.log('initMessage');
    //保留当前回调
    const tickerCallback = symbolInfo.name + "-" + resolution + "Callback"; //TODO: GDEXGDC/GXC-1DCallback
    this.cacheData[tickerCallback] = onLoadedCallback;
    //商品名
    const symbol = this.symbol;
    //如果当前时间节点已经改变，停止上一个时间节点的订阅，修改时间节点值
	console.log("interval :",this.interval);
	console.log("resolution:",resolution);
    if (this.interval !== resolution) {
      this.unSubscribe(this.interval)
      this.interval = resolution;
    }
	console.log("no change getbars:");
    //TODO: 获取当前时间段的数据，在onMessage中执行回调onLoadedCallback
    if (symbolInfo && resolution && rangeStartDate && rangeEndDate) {
		 console.log(symbolInfo.full_name);
      let symbol = symbolInfo.full_name;
		var kdata =this.generateHistoryBars(resolution); 
		var self = this;
		var inter =this.initresolutionstr(resolution);
		if(symbol == "MDNUSDT"){
			let e ={
				 type: "getBars",
				 data:kdata,
				 resolution:resolution
			}
				 
			self.onMessage(e);
			
			return;
		}
		
		$.get("https://api.binance.com/api/v3/klines?symbol="+ this.symbol+"&interval="+inter,function (data,status){
			console.log("data",data.length);
			console.log("status",status);
			console.log("data",data);
			let e ={
				 type: "getBars",
				 data:data,
				 resolution:resolution
			}
				 
			self.onMessage(e);
			  
		});
		
		
    }
  }
  // initresolutionstr(resolution) {
  //   let resolutionstr = '';
  //   if (resolution <= 60) {
  //     resolutionstr = resolution + 'm';
  //   } else if (resolution == 'D') {
  //     resolutionstr = '1w';
  //   } else if (resolution == '1D') {
  //     resolutionstr = '1d';
  //   } else {
  //     resolutionstr = '1d';
  //   }
  //   return resolutionstr;
  // }
initresolutionstr(res) {
	  var inter;
	  console.log("initresolutionstr"+res);
	     
   switch(this.interval){
   	case "1":
   		inter="1m";
   		break;
   	case "5":
   		inter="5m";
   		break;
   	case "15":
   		inter="15m";
   		break;
   	case "30":
   		inter="30m";
   		break;
   	case "60":
   		inter="1h";
   		break;
   	case "240":
   		inter="4h";
   		break;
   	case "1D":
   		inter="1d";
   		break;
   	case "1M":
   		inter="1m";
   		break;
   	default :break;
   }
   return inter;
  }
  /**
   * @description 发起订阅
   */
  subscribe() {
	  console.log('subscribe');
   clearTimeout(this.timer);
console.log(this.symbol);
 this.socket.doClose();
 this.socket.destroy();
 var curl=this.wsurl+"stream?streams="+this.symbol.toString().toLowerCase()+"@kline_"+this.initresolutionstr(this.interval);
   this.socket = new socket(curl);
   this.socket.doOpen();
	this.socket.on('open', () => {
	 
	  });
	  this.socket.on('message', this.onMessage.bind(this));
	  this.socket.on('close', this.onClose.bind(this));
	
	 
  }
  /**
   * @description 取消订阅
   * @param {String} interval 周期
   */
  unSubscribe(interval) {
	   console.log('unSubscribe');
	   console.log(this.symbol);
    // TODO: 停止订阅，删除过期缓存、缓存时间、缓存状态
    const ticker = `LongBit${this.symbol}-${interval}`; //TODO: GDEXGDC/GXC-1D
    const tickertime = ticker + "load";
    const tickerstate = ticker + "state";
    const tickerCallback = ticker + "Callback";
    delete this.cacheData[ticker];
    delete this.cacheData[tickertime];
    delete this.cacheData[tickerstate];
    delete this.cacheData[tickerCallback];
    
	 
  }
  generateHistoryBars(interval){
	  // let barsData = {
	  // 	date: e.data[i][0],
	  // 	dateEnd: e.data[i][6],
	  // 	symbol:this.symbol,
	  // 	//period: data[i][0],
	  // 	open: parseFloat(e.data[i][1]),
	  // 	close: parseFloat(e.data[i][4]),
	  // 	high: parseFloat(e.data[i][2]),
	  // 	low: parseFloat(e.data[i][3]),
	  // 	volume: parseFloat(e.data[i][5]),
	  // 	time: e.data[i][0],
	  // 	isEnd: false,
	  // 	amount: parseFloat(e.data[i][7])
	   
	  // };
	    
	   var data = [];
	  // return data;
	  var currentTimestamp = Date.parse(new Date());
	  let curentPrice = new BigNumber(this.getUrlParam("p"));
	  
	   let l = 200;
	  console.log("cup:",curentPrice);
	  if(interval == "1D" ){
		  interval =  1000*60*60*24;
		  l=30;
	  } else if(interval == "1M" ){
		  interval =  1000*60*60*24*30;
		  l=1;
	  } else{
		  interval =  1000* 60*interval;
		  
	  }
	  let n = 1;
	 
	  let intervalPrice = 0.04/1000/60/60/24*interval;
	  console.log("intervalPrice",intervalPrice);
	  let earyPrice = 0.0330-(500*intervalPrice);
	 let close =new BigNumber(curentPrice);
	  let open =new BigNumber(0);
	  let high =new BigNumber(0);
	  let low =new BigNumber(0);
	  while(n++  < l){
		  var plusOrMinus =n%Math.floor(Math.random() * 10)==0 ? -1 : 1; 
		 
		//  curentPrice= parseFloat(curentPrice)+parseFloat(curentPrice)*0.04; 
		   var date =  currentTimestamp-interval*n;
		   if(plusOrMinus == 1){
			  // console.log("curentPrice", curentPrice);
			     open = close.minus(close.times(new BigNumber(this.randomFrom(1,5)/100)))   ;
				 
				 close = open.plus(curentPrice.times(new BigNumber(this.randomFrom(1,5)/100)));
				   
				 high =close.plus(close.times(new BigNumber(this.randomFrom(1,5)/100))); 
			 
				 low = open.minus(open.times(new BigNumber(this.randomFrom(1,5)/100)));
				 
		   }else{
			   
			   open = close.minus(close.times(new BigNumber(this.randomFrom(1,5)/100)))   ;
			   
			   close = open.minus(curentPrice.times(new BigNumber(this.randomFrom(1,5)/100)));
			     
			   high =open.plus(open.times(new BigNumber(this.randomFrom(1,5)/100))); 
			   			 
			   low = close.minus(close.times(new BigNumber(this.randomFrom(1,5)/100)));
			   
		   }
		 
		
		  var volume = 1000*Math.random() ;
		  var time = date;
		  var amount = 1000000*volume*Math.random();
		  var dateEnd = date+interval;
		  var symbol = "MDNUSDT";
		  var isEnd = false;
		  
		  var item=[date,open.toString(),high.toString(),low.toString(),close.toString(),volume.toString(),dateEnd,amount.toString()];
		 
		 // console.log("item:",item);
		 
		   
		  data.unshift(item);
	  }
	  
	  return data;
	   
  }
    getUrlParam(name){
  	 var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  	 
  	 var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  	 
  	 if (r!=null) return unescape(r[2]); return null; //返回参数值
   }
    
  randomFrom(lowerValue,upperValue)
  {
      return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
  }
  /**
   * @description 切换交易对
   * @param {String} newpair 新交易对
   * @param {String} oldpair 旧交易对
   */
  // switchtranspair(newpair, oldpair) {
  //   console.log("我终于还是被调用了")
  //   const newpairinfo = this.getSymbolinfo(newpair); //TODO: 新交易对详情 {coreAssetId: 1, tradeAssetId: 18}
  //   // TODO: 旧交易对 停止订阅，删除过期缓存、缓存时间、缓存状态
  //   const oldticker = `GDEX${oldpair}-${this.interval}`;
  //   this.datafeeds.unsubscribeBars(oldticker); //TODO: 取消订阅
  //   const tickertime = oldticker + "load";
  //   const tickerstate = oldticker + "state";
  //   const tickerCallback = oldticker + "Callback";
  //   delete this.cacheData[oldticker];
  //   delete this.cacheData[tickertime];
  //   delete this.cacheData[tickerstate];
  //   delete this.cacheData[tickerCallback];

  //   this.symbol = newpair;
  //   this.initsymbolparams = newpairinfo;
  //   this.isLoading = true;
  //   return new Promise((resolve, reject) => {
  //     resolve({ //TODO: reslove回递消息确认
  //       symbol: this.symbol,
  //       initsymbolparams: this.initsymbolparams
  //     })
  //   });
  // }
  /**
   * @description 销毁操作
   */
  destoryinstance() {
    this.unSubscribe(this.interval);
    return new Promise((resolve, reject) => {
      this.widgets = null;
      this.cacheData = {};
      this.resolveSymbolinfo = {}; //币种信息
      this.lastTime = null;
      this.getBarTimer = null;
      this.studies = []; //配置项
      this.socket.destroy();
      resolve(true);
    });
  }
}

// export default TVjsApi;
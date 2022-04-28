"use strict";
 
// Address of the selected account
let selectedAccount = null;
// let web3;
let venPrice=0.0000000;
let ethPrice=0;
let venQuantity;
let buyCoin = "TRX";
let childs = [];
let ethLastPrice = 0;
let balance_eth = 0;
let balance_usdt = 0;
let invite_profits = 0;
let incomes = [];
let user;


let  tronWeb =null;
 
// // 插件发送代码
// window.dispatchEvent(new Event('tronLink#initialized'));

// // 示例
// // 建议接收方法
// if (window.tronLink) {
//   handleTronLink();
// } else {
//   window.addEventListener('tronLink#initialized', handleTronLink, {
//     once: true,
//   });

//   // If the event is not dispatched by the end of the timeout,
//   // the user probably doesn't have TronLink installed.
//   setTimeout(handleTronLink, 3000); // 3 seconds
// }

// function handleTronLink() {
//   const { tronLink } = window;
//   if (tronLink) {
//     console.log('tronLink successfully detected!');
//     // Access the decentralized web!
//   } else {
//     console.log('Please install TronLink-Extension!');
//   }
// }
 
 window.addEventListener('message', function (e) {
        
		// console.log("e.data.message",e.data.message);
		// console.log("e.data.message.action ",e.data.message.action );
        if (e.data.message && e.data.message.action == "tabReply") {
   //          console.log("tabReply event", e.data.message)
			// console.log("window.tronWeb;",window.tronWeb);
			// 	console.log("	window.tronLink;",	window.tronLink);
		
            // if (e.data.message.data.data.node.chain == '_'){
            //     console.log("tronLink currently selects the main chain")
            // }else{
            //     console.log("tronLink currently selects the side chain")
            // }
        }

   //      if (e.data.message && e.data.message.action == "setAccount") {
			// fetchAccountData();
   //          console.log("setAccount event", e.data.message)
   //          console.log("current address:", e.data.message.data.address)

   //      }
        if (e.data.message && e.data.message.action == "setNode") {
            console.log("setNode event", e.data.message)
            if (e.data.message.data.node.chain == '_'){
                console.log("tronLink currently selects the main chain")
            }else{
                console.log("tronLink currently selects the side chain")
            }
			fetchAccountData();
			}
       // Tronlink chrome v3.22.1 & Tronlink APP v4.3.4 started to support 
        if (e.data.message && e.data.message.action == "connect") {
            console.log("connect event", e.data.message.isTronLink);
			fetchAccountData();
        }
          
       // Tronlink chrome v3.22.1 & Tronlink APP v4.3.4 started to support 
        if (e.data.message && e.data.message.action == "disconnect") {
            console.log("disconnect event", e.data.message.isTronLink)
        }
          
       // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support 
        if (e.data.message && e.data.message.action == "accountsChanged") {
			 
			fetchAccountData();
            console.log("accountsChanged event", e.data.message);
            console.log("current address:", e.data.message.data.address);
			
        }
          
       // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support  
        if (e.data.message && e.data.message.action == "connectWeb") {
            console.log("connectWeb event", e.data.message);
            console.log("current address:", e.data.message.data.address);
			fetchAccountData();
        }
          
        // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support      
        if (e.data.message && e.data.message.action == "acceptWeb") {
            console.log("acceptWeb event", e.data.message)
        }
        // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support      
        if (e.data.message && e.data.message.action == "disconnectWeb") {
            console.log("disconnectWeb event", e.data.message)
        }
          
        // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support     
        if (e.data.message && e.data.message.action == "rejectWeb") {
            console.log("rejectWeb event", e.data.message)
        }
           
        //}
    })



/**
 * Rinkeby contract address
 */
//// let contractaddress = "TEhUzCvvhyNhkc6KjuXjMpjz2MQic2jh46";
 



/**
 * 
	ETH Main contract address
 */
let contractaddress = "TPLn8nbUvbyVHWVkGSktTw54i6KuTME9QP";






/***
Rinkeby usdt address
*/
//let usdtcontractaddress = "TBqWFFQmRYGsqtdeVGx33GPnywhfzHH2KG";



 



/**
 * 
 eth main usdt address
 *
 */
 let usdtcontractaddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
//0x8129fc1c
let currentContract;
let isApprove = false;
/**
 * Setup the orchestra
 */
async function init() {
	
	
	
	await onConnect();
	
 

}
 
function initmarket() {
	var wss_path = "wss://stream.binance.com:9443";
	var wss_path = wss_path +
		"/stream?streams=btcusdt@ticker/ethusdt@ticker/trxusdt@ticker/xrpusdt@ticker/adausdt@ticker/dogeusdt@ticker";
	var ws = new WebSocket(wss_path);
	var coinlist = ['BTC', 'ETH','MDN','TRX', 'XRP', 'ADA', 'DOGE'];
	var coinimages = ['btc.svg','eth.svg', 'mdn.png','trx.svg', 'xrp.svg', 'ada.svg', 'doge.svg'];
	$("#main3 a").remove();
	for (let i = 0; i < coinlist.length; i++) {
		var html = '<a href="k.html?c=' + coinlist[i] + '" id="' + coinlist[i] +
			'USDT"><div class="zs_nr"><div class="zs_nr1"><img src="images/' + coinimages[i] + '">' + coinlist[i] +
			'</div><div class="zs_nr2">0</div><div class="zs_nr3 green">+0.00%</div></div>';
		if(coinlist[i] == "MDN"){
			  html = '<a href="k.html?p='+venPrice+'&c=' + coinlist[i] + '" id="' + coinlist[i] +
				'USDT"><div class="zs_nr"><div class="zs_nr1"><img src="images/' + coinimages[i] + '">' + coinlist[i] +
				'</div><div class="zs_nr2">0</div><div class="zs_nr3 green">+0.00%</div></div>';
		}
		$("#main3").append(html);

	}
	ws.onopen = function() {

	};

	ws.onmessage = function(e) {

		var info = jQuery.parseJSON(e.data);
		if (info.data.s == "TRXUSDT") {
			ethLastPrice = parseFloat(info.data.c).toFixed(2);
			   totalincome();
		if(selectedAccount != null){
			let p = Math.random();
			var v = Number(venPrice)+Number(Number(venPrice)*Number(0.07))  ;
			console.log("vfristvprice",v);
			v = Number(v)  +(Number(v)  *Number(7-p)/100) ;
			console.log("vprice",v);
			$("#MDNUSDT .zs_nr3").html("+" + parseFloat(7-p).toFixed(2)+"%");
			$("#MDNUSDT .zs_nr2").html("<span>$</span>" + parseFloat(v).toFixed(5));
			}
		}
		
		
		$("#" + info.data.s + " .zs_nr2").text("$" + parseFloat(info.data.c).toFixed(2));
		if (info.data.P >= 0) {
			$("#" + info.data.s + " .zs_nr3").css("color", "#23d683");
			$("#" + info.data.s + " .zs_nr3").text("+" + parseFloat(info.data.P).toFixed(2) + "%");
		} else {
			$("#" + info.data.s + " .zs_nr3").css("color", "red");
			$("#" + info.data.s + " .zs_nr3").text(parseFloat(info.data.P).toFixed(2) + "%");
		}

		// console.log(info.data.s);
	}
	ws.onclose = function(e) {

	};
	ws.onerror = function(evt) {

	};
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

	// Get a Web3 instance for the wallet
	
	console.log("tronWeb.isConnected()",window.tronWeb.isConnected());
	
	 
	 console.log(window.tronWeb);
	if(window.tronWeb.fullNode.host.toLocaleLowerCase().indexOf("nileex") != -1){
		document.querySelector("#network-name").textContent = "NILEEX" ;
	}else if (window.tronWeb.fullNode.host.toLocaleLowerCase().indexOf("shasta") != -1){
		document.querySelector("#network-name").textContent = "SHASTA" ;
	}else if (window.tronWeb.fullNode.host.toLocaleLowerCase().indexOf("trongrid") != -1){
		document.querySelector("#network-name").textContent = "MAINNET" ;
	}else{
		document.querySelector("#network-name").textContent = "MAINNET" ;
	}
	
	document.querySelector("#network-name").style.display = "none";
	// // Get list of accounts of the connected wallet
	// const accounts = await web3.eth.getAccounts();

	// // MetaMask does not give you all accounts, only the selected account
	// console.log("Got accounts", accounts);
	selectedAccount = window.tronWeb.defaultAddress.base58;
	console.log("selectedAccount",selectedAccount);
	document.querySelector("#selected-account").textContent = selectedAccount.substr(0, 8) + "...." + selectedAccount.substr(26, 8);

	
	document.querySelector("#btn-connect").style.display = "none";
	document.querySelector("#btn-disconnect").style.display = "none";
	// document.querySelector("#network-name").style.display = "block";
	document.querySelector("#selected-account").style.display = "block";
	var curWwwPath = window.document.location.href;
	var pathname = window.document.location.pathname;
	var pos = curWwwPath.lastIndexOf("/");
	var localhostPath = curWwwPath.substring(0, pos);
	
	
	$("#fuzhi").html(localhostPath + "/index.html?address=" + selectedAccount);
	
	console.log("contractaddress",contractaddress);
	console.log("window.tronWeb.fullNode.host",window.tronWeb.fullNode.host);
	currentContract = await	window.tronWeb.contract().at(contractaddress);
	
	await getuser();
	await ongetvenprice();
	await ongetethprice();
	await ongetvenquantity();

 
	$(".jrjg_jg").html("<span>$</span>" + venPrice);	
	//$("#MDNUSDT .zs_nr2").html("<span>$</span>" + venPrice);
	$("#venquantity").html("<span>" + parseFloat(venQuantity).toFixed(4) + "</span>");
	$("#venincome").html("<span>$" + parseFloat(venQuantity * venPrice).toFixed(4) + "</span>");

	// getbuylist();
	await getwithdrawlist();
	// await initmarket();
	await getethbalance();

	//await getusdtbalance();

	
	isApprove = false;
	//  isApprove = await isUsdtApproveed();
	console.log("isApprove:",isApprove);
	 
	initmarket();
	// getchildlist();
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象

	var r = window.location.search.substr(1).match(reg); //匹配目标参数

	if (r != null) return unescape(r[2]);
	return null; //返回参数值
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

	document.querySelector("#btn-connect").style.display = "none";
	document.querySelector("#btn-disconnect").style.display = "none";
 
		await fetchAccountData();
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {
	  console.log("  onConnect   ");
	  
	  
	  console.log("tp connentd ",tp.isConnected());
	  if(  tp.isConnected()){
	  	console.log("tp wallet");
	  	  await tp.getCurrentWallet().then(async  function(result) {
	  		console.log("current wallet tp",result.data.blockchain);
	  		if(result.data.blockchain != 'tron' && result.msg=="success"){
	  			await  tp.getWallet({walletTypes: ['tron'], switch: true}).then(async  function(r) {
	  				console.log("change wallet tp");
					// window.tronWeb.defaultAddress.base58 = r.data.address;
	  				//window.location.href=window.location.href;
	  				//return;
	  				//document.execCommand('Refresh');
	  				 
	  			  
	  			});
	  			
	  		}else{
				// console.log("  connection tronweb isConnected ",window.tronWeb.isConnected());
				// window.tronWeb.setAddress(result.data.address);
				// window.tronWeb.defaultAddress.base58 = result.data.address;
	  			console.log("is tron wallet tp");
	  		//	 console.log("window.tronWeb.defaultAddress.base58",window.tronWeb.defaultAddress.base58);
	  			//return;
	  		}
	  	 
	   
	  
	  });
	  	
	  
	  	
	  }
try {
   var obj = setInterval(async ()=>{
              if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
				   console.log("  connection tronweb isConnected ",window.tronWeb.isConnected());
					console.log("window.tronWeb.defaultAddress.base58",window.tronWeb.defaultAddress.base58);
				   
            //if (window.tronLink.tronWeb) 
                  clearInterval(obj);
                  tronWeb = window.tronWeb;
                  await refreshAccountData();
                  console.log(tronWeb);
              }else{
				    console.log("  no window.tronweb   ");
				 
					
					
					
					
					
			  }
          }, 10);
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
	 
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

	// console.log("Killing the wallet connection");

	 
	// selectedAccount = null;

	// // Set the UI back to the initial state
	// document.querySelector("#btn-connect").style.display = "block";
	// document.querySelector("#btn-disconnect").style.display = "none";

	// document.querySelector("#network-name").style.display = "none";
	// document.querySelector("#selected-account").style.display = "none";
}
async function getethbalance() {

	await tronWeb.trx.getAccount(selectedAccount).then(async function(result) {
		console.log("balance",result);
		balance_eth = parseFloat(tronWeb.fromSun(result.balance)).toFixed(4);
		 console.log("balance_eth",balance_eth);
		if (buyCoin == "TRX") {
			console.log(buyCoin);
			$("#balance").html('balance:' + balance_eth + " trx");
		}

	});

}
async function getusdtbalance() {
	console.log('getusdtbalance');

	var helloContract =await  tronWeb.contract().at(usdtcontractaddress);  
	var helloResult = await helloContract.balanceOf(selectedAccount).call().then(async function(result) {

		console.log(result);
		balance_usdt = parseFloat(parseInt(result)/1000000).toFixed(4);
		console.log(buyCoin);
		if (buyCoin == "USDT") {
			console.log(buyCoin);
			$("#balance").html('balance:' + balance_usdt + ' usdt');
		}


	});

	console.log("contract ok");
}
async function onBuy() {
	console.log('onBuy');
	var amount = $("#txtamount").val();
	var code = $("#txtinvitecode").val();
	
	//var mail = $("#txtmail").val()
	//var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	if (amount == '' || isNaN(amount)) {
		$(".tishi1").show(100);
		return;
	}
	 
	if (code == '') {
		$(".tishicode").show(100);
		return;
	}
	if(code == selectedAccount){
		$(".tishicode").show(100);
		return;
	}
	// if (mail == '' || !reg.test(mail)) {
	// 	$(".tishimail").show(100);
	// 	return
	// }
	
	if (buyCoin == "USDT") {
		 
		if (isApprove) {
			await onbuyusdt();
		} else {
		 
			await onapprove();
		}
		  
		return;
	}

	 
	try{
		 
		var helloResult = await currentContract.buy('', code).send({
			feeLimit:800000000,
			callValue:tronWeb.toSun(amount),
			shouldPollResponse:false,
		}).then(async function(result) {
				console.log(result);
				
				var r = await gettran(result);
				if(r == "SUCCESS"){
					$("#popsuccess").show().delay(2000).hide(200);
					fetchAccountData();
				}else if(r =="OUT_OF_ENERGY"){
					$("#poperror").text("Failed "+r);
					$("#poperror").show().delay(2000).hide(200);
				}else{
					$("#poperror").text("Failed "+r);
					$("#poperror").show().delay(2000).hide(200);
				}
				
				
		
			});
		
	}catch(ex){
		$("#poperror").text(ex.message);
		$("#poperror").show().delay(2000).hide(200);
		console.log(ex);
	} 
	
 
	console.log("buy end");
}
	 
	
async function gettran(tranhash){
	console.log("gettran");
	var ret = "";
	while(true){
		var helloResult = await window.tronWeb.trx.getTransaction(tranhash).then(async function(result) {
				
			 console.log("transaction ",result);
			if(result.hasOwnProperty("ret")){
							  
				console.log("transaction ",result.ret[0].contractRet);
				ret = result.ret[0].contractRet;
				 
				
			} 
		});
		if(ret != ""){
			break;
			 
		}
	}
	 
	return ret;
}
async function onapprove() {
	console.log('onapprove');
  
	var helloContract = await  tronWeb.contract().at(usdtcontractaddress); 
	var helloResult = await helloContract.approve(contractaddress, tronWeb.toSun("10000000000000")).send({
		feeLimit:100000000,
		callValue:0,
		shouldPollResponse:false
	}).then(async function(result) {
		console.log(result);
		await onbuyusdt();
		

	});

}
async function onbuyusdt() {
	console.log('onbuyusdt');
 
	
	//var mail = document.querySelector("#txtmail").value;
	var parent = document.querySelector("#txtinvitecode").value;
	var amount = document.querySelector("#txtamount").value;
	amount = tronWeb.toSun(amount);
	console.log("buy usdt amount:",amount);
	 
	var helloResult = await currentContract.buyuseusdt('', parent, amount).send({
		feeLimit:800000000,
		callValue:0,
		shouldPollResponse:false
	}).then(async function(result) {
		console.log(result);
		
		var r = await gettran(result);
		if(r == "SUCCESS"){
			$("#popsuccess").show().delay(2000).hide(200);
			fetchAccountData();
		}else if(r =="OUT_OF_ENERGY"){
			$("#poperror").text("Failed "+r);
			$("#poperror").show().delay(2000).hide(200);
		}else{
			$("#poperror").text("Failed "+r);
			$("#poperror").show().delay(2000).hide(200);
		}
 

	});

}

async function ongetvenprice() {
	try{
		
		console.log("ongetvenprice");
		
		var helloResult = await currentContract.getprice().call().then(async function(result) {
				
			venPrice =parseFloat(tronWeb.fromSun(parseInt(result))).toFixed(4);// web3.utils.fromWei(result, 'ether');
		
			console.log("venPrice",venPrice);
			return result;
		
		});
		
		return venPrice;
		
	}catch(ex){
		console.log(ex);
	}
	
}
async function ongetethprice() {
	try{
		console.log("ongetethprice");
		
		// var helloResult = await currentContract.setting("isusewinklink").call().then(async function(result) {
		// 		console.log("isusewinklink",result);
		// 		if(parseInt(result) ==1){
					var lastprice = await currentContract.getLatestPrice().call().then(async function(last) {
							ethPrice =parseFloat(tronWeb.fromSun(parseInt(last))).toFixed(4);
							ethLastPrice = ethPrice;
							console.log("ethPrice isusewinklink",ethPrice);
							
						});
		// 		}else{
		// 			var ethusdtprice = await currentContract.setting("price_eth_usdt").call().then(async function(ers) {
		// 				ethPrice =parseFloat(tronWeb.fromSun(parseInt(ers))).toFixed(4);
		// 				ethLastPrice = ethPrice;
		// 				console.log("ethPrice price_eth_usdt",ethPrice);
		// 				return ethPrice;
					
		// 			});
		// 		}
		// 	});
		
		
		
		return ethPrice;
	}catch(ex){
		console.log(ex);
		
	}
	
 
}
async function ongetvenquantity() {
	try{
		console.log('ongetvenquantity');
		 
		var helloResult = await currentContract.balanceOf(selectedAccount).call().then(async function(result) {
		
			console.log(result);
			venQuantity =tronWeb.fromSun(result);
		
			return result;
		
		});
		
		venQuantity = tronWeb.fromSun(helloResult); 
		return venQuantity;
	}catch(ex){
		console.log(ex);
	}
	
}
   
async function getwithdraw(withdrawaddress, withdrawindex) {
	try{
		console.log('getwithdraw');
		var helloResult = await currentContract.withdraw_history(withdrawaddress, withdrawindex).call().then(async function(result) {
		
			console.log(result);
		
			return result;
		
		});
		
		return helloResult;
	}catch(ex){
		console.log(ex);
	}
	

}

async function getuser() {
	try{
		console.log('getuser');
		
		var helloResult = await currentContract.users(selectedAccount).call().then(async function(result) {
		
			// 发送 HTTP 头部 
			// HTTP 状态值: 200 : OK
			// 内容类型: text/plain
			if (result.isValue) {
				 
				user = result;
				 
				$("#txtinvitecode").val(window.tronWeb.address.fromHex(user.parent));
			 
				//$("#txtmail").val(user.mail);
		
				$("#divcode").hide();
				// $("#divmail").hide();
			} else {
				$("#txtinvitecode").val();
				//$("#txtmail").val();
				$("#divcode").show();
				// $("#divmail").show();
			}
		
			console.log(result);
		
		});
		console.log('getuser end ');
		return helloResult;
	}catch(ex){
		console.log(ex);
	}
	
}
async function getlen(i, fromaddress) {
	try{
		console.log('getlen');
		
		
		console.log("i:" + i + "/n fromaddress:" + fromaddress);
		
		var helloResult = await currentContract.getLen(i, fromaddress).call().then(async function(result) {
		
			console.log("get len result :" + result);
		
			return result;
		
		});
		return helloResult;
	}catch(ex){
		console.log(ex);
	}	


}

function totalincome() {
	try{
		// const web3 = new Web3(provider);
		var amount = 0;
		
		invite_profits = 0;
		for (var i = 0; i < incomes.length; i++) {
			var income = incomes[i];
		
			if (income.coin.toString().toLocaleUpperCase() == "TRX") {
		
				amount = parseFloat(tronWeb.fromSun(income.quantity) * ethLastPrice).toFixed(4);
			} else if (income.coin.toString().toLocaleUpperCase() == "USDT") {
		
				amount = parseFloat(tronWeb.fromSun(income.quantity)).toFixed(4);
			} else if (income.coin.toString().toLocaleUpperCase() == "MDN") {
		
				amount = parseFloat(tronWeb.fromSun(income.quantity) * venPrice).toFixed(4);
			}
			invite_profits = parseFloat(invite_profits) + parseFloat(amount);
		
		
		
		}
		// console.log("ethLastPrice",ethLastPrice);
		// console.log("venPrice",venPrice);
		$("#rcmdincome").html('<span>$' + invite_profits.toFixed(4) + '</span>');
		var venvalue = parseFloat(parseFloat(venQuantity) * parseFloat(venPrice));
		
		var total = parseFloat(venvalue) + parseFloat(invite_profits);
		$(".tj_ts").html('$' + total.toFixed(4));
		
	}catch(ex){
		console.log(ex);
	}
	

}
async function getwithdrawlist() {
	try{
		console.log("getwithdrawlist ok");
		
		var withdrawlist = $("#mian_news");
		
		var len = getlen(1, selectedAccount).then(async function(result) {
		
			for (var i = 0; i < result; i++) {
				getwithdraw(selectedAccount, i).then(async function(result) {
					incomes.push(result);
		
				});
			}
		
		});
	}catch(ex){
		console.log(ex);
	}
	
}
async function onchooseusdt() {
	$(".jrjg_nr_xz").removeClass("activess");

	$(".ceth").addClass('activess');
	buyCoin = "USDT";
	$("#txtquantity").val("");
	$("#txtamount").val("");
	await getusdtbalance();

}
async function onchooseeth() {

	$(".jrjg_nr_xz").removeClass("activess");
	$(".cusdt").addClass('activess');
	buyCoin = "TRX";
	$("#txtquantity").val("");
	$("#txtamount").val("");
	await getethbalance();

}
async function onAmountChange() {
	console.log($("#txtamount").val());
 
	console.log("ethLastPrice:",ethLastPrice);
	console.log("venPrice:",venPrice);
	console.log("amount:",amount);
	var amount = parseFloat($("#txtamount").val());

	if (isNaN(amount) || amount == 0 || venPrice == 0 || ethLastPrice == 0) {
		$("#txtquantity").val("");

		return;
	}
	$(".tishi1").hide(100);
	
	if (buyCoin == "TRX") {
		
		$("#txtquantity").val(parseFloat(amount * ethLastPrice / venPrice).toFixed(4));
	} else if (buyCoin == "USDT") {
		$("#txtquantity").val(parseFloat(amount / venPrice).toFixed(4));
	}
}
async function onQuantityChange() {
	console.log($("#txtquantity").val());
	var quantity = parseFloat($("#txtquantity").val());

	if (isNaN(quantity) || quantity == 0 || venPrice == 0 || ethLastPrice == 0) {
		$("#txtamount").val("");
		return;
	}
	if (buyCoin == "TRX") {
		$("#txtamount").val(parseFloat(quantity * venPrice / ethLastPrice).toFixed(4));
	} else if (buyCoin == "USDT") {
		$("#txtamount").val(parseFloat(quantity * venPrice).toFixed(4));
	}
}
async function onMax() {
	if (buyCoin == "TRX") {
		$("#txtamount").val(balance_eth);
	} else {
		$("#txtamount").val(balance_usdt);
	}
	onAmountChange();
}
async function onMailChange() {
	if ($("#txtmail") != "") {
		$(".tishimail").hide(100);
	}
}
async function onCodeChange() {
	if ($("#txtinvitecode") != "") {
		$(".tishicode").hide(100);
	}
}
 
	/**
	 * Main entry point.
	 */
	window.addEventListener('load', async () => {
		init();
		document.querySelector("#btn-connect").addEventListener("click", onConnect);
		// document.querySelector("#btn-testarr").addEventListener("click",  ontestarr);
		// document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
		document.querySelector("#btn-Buy").addEventListener("click", onBuy);
		$("#txtamount").bind("input propertychange", onAmountChange);
		$("#txtquantity").bind("input propertychange", onQuantityChange);
		$("#txtmail").bind("input propertychange", onMailChange);
		$("#txtinvitecode").bind("input propertychange", onCodeChange);
		$(".max").click(onMax);
	
	
		document.querySelector("#buycoinusdt").addEventListener("click", onchooseusdt);
		document.querySelector("#buycoineth").addEventListener("click", onchooseeth);
	
	});
  
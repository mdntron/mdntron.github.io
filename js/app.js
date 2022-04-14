"use strict";
/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */


// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic; //window.Fortmatic;
const evmChains = window.evmChains;


// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount = null;
let web3;
let venPrice;
let ethPrice;
let venQuantity;
let buyCoin = "ETH";
let childs = [];
let ethLastPrice = 0;
let balance_eth = 0;
let balance_usdt = 0;
let invite_profits = 0;
let incomes = [];
let user;


/**
 * Rinkeby contract address
 */
// let contractaddress = "0xAb0DF05C078Cb702a8956023413fF0abC7B71867";
 


/**
 * 
	ETH Main contract address
 */
let contractaddress = "0x07FA92050eDB387FE26E77859c9a5AdF107Cd72e";






/***
Rinkeby usdt address
*/
 //let usdtcontractaddress = "0x9C9B4Ff0E860Bdebf699aB5dE8889CdEe0d30063";



 



/**
 * 
 eth main usdt address
 *
 */
let usdtcontractaddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
//0x8129fc1c
let currentContract;
let isApprove = false;
/**
 * Setup the orchestra
 */
async function init() {

	console.log("Initializing example");
	console.log("WalletConnectProvider is", WalletConnectProvider);
	console.log("Fortmatic is", Fortmatic);
	console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

	const providerOptions = {
		walletconnect: {
			package: WalletConnectProvider,
			options: {
				// Mikko's test key - don't copy as your mileage may vary
				infuraId: "860215d48b274b3fbf047515d6c096bc",
			}
		},

		fortmatic: {
			package: Fortmatic,
			options: {
				// Mikko's TESTNET api key
				key: "pk_test_391E26A3B43A3350"
			}
		},
		walletlink: {
			package: WalletLink,
			options: {
				appName: "MDN",
				infuraId: "860215d48b274b3fbf047515d6c096bc",
				appLogoUrl: "https://mdncoin.github.io/images/mdn.png",
				darkMode: false,
				networkUrl: `https://mainnet.infura.io/v3/860215d48b274b3fbf047515d6c096bc`,
				chainId: 1,
			},
			 
			package: WalletLink,
			connector: async (_, options) => {
			    const { appName, networkUrl, chainId } = options
			    const walletLink = new WalletLink({
			        appName,
			    })
			    const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
			    await provider.enable()
			    return provider
			},
			
			
			
			
		},


	};

	web3Modal = new Web3Modal({
		cacheProvider: true, // optional
		providerOptions, // required
		disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
	});

	console.log("Web3Modal instance is", web3Modal);
	$("#txtinvitecode").val(getUrlParam("address"));
	
	await onConnect();

}

function initmarket() {
	var wss_path = "wss://stream.binance.com:9443";
	var wss_path = wss_path +
		"/stream?streams=btcusdt@ticker/ethusdt@ticker/bnbusdt@ticker/xrpusdt@ticker/adausdt@ticker/dogeusdt@ticker";
	var ws = new WebSocket(wss_path);
	var coinlist = ['BTC', 'ETH','MDN','BNB', 'XRP', 'ADA', 'DOGE'];
	var coinimages = ['btc.svg','eth.svg', 'mdn.png','bnb.svg', 'xrp.svg', 'ada.svg', 'doge.svg'];
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
		if (info.data.s == "ETHUSDT") {
			ethLastPrice = parseFloat(info.data.c).toFixed(2);
			//  totalincome();
		if(selectedAccount != null){
			let p = Math.random();
			var v = venPrice+(venPrice*0.07);
			v =v+(v *parseFloat(7-p).toFixed(2)/100);
			$("#MDNUSDT .zs_nr3").html("+" + parseFloat(7-p).toFixed(2)+"%");
			$("#MDNUSDT .zs_nr2").html("<span>$</span>" + parseFloat(v).toFixed(4));
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
	web3 = new Web3(provider);

	console.log("Web3 instance is", web3);

	currentContract = new web3.eth.Contract(abi, contractaddress);

	// Get connected chain id from Ethereum node
	const chainId = await web3.eth.getChainId();
	// Load chain information over an HTTP API
	const chainData = evmChains.getChain(chainId);
	document.querySelector("#network-name").textContent = chainData.name;

	// Get list of accounts of the connected wallet
	const accounts = await web3.eth.getAccounts();

	// MetaMask does not give you all accounts, only the selected account
	console.log("Got accounts", accounts);
	selectedAccount = accounts[0];

	document.querySelector("#selected-account").textContent = selectedAccount.substr(0, 4) + "...." +
		selectedAccount.substr(38, 4);

	document.querySelector("#btn-connect").style.display = "none";
	document.querySelector("#btn-disconnect").style.display = "block";
	document.querySelector("#network-name").style.display = "block";
	document.querySelector("#selected-account").style.display = "block";
	var curWwwPath = window.document.location.href;
	var pathname = window.document.location.pathname;
	var pos = curWwwPath.lastIndexOf("/");
	var localhostPath = curWwwPath.substring(0, pos);
	$("#fuzhi").html(localhostPath + "/index.html?address=" + selectedAccount);


	await ongetvenprice();
	await ongetethprice();
	venQuantity = await ongetvenquantity();


	$(".jrjg_jg").html("<span>$</span>" + venPrice);	
	//$("#MDNUSDT .zs_nr2").html("<span>$</span>" + venPrice);
	$("#venquantity").html("<span>" + parseFloat(venQuantity).toFixed(4) + "</span>");
	$("#venincome").html("<span>$" + parseFloat(venQuantity * venPrice).toFixed(4) + "</span>");

	// getbuylist();
	await getwithdrawlist();
	// await initmarket();
	await getethbalance();

	await getusdtbalance();

	await getuser();
	isApprove = false;
	isApprove = await isUsdtApproveed();
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
	document.querySelector("#btn-disconnect").style.display = "block";

	document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
	await fetchAccountData(provider);
	document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

	console.log("Opening a dialog", web3Modal);
	try {
		console.log('onConnect');
		provider = await web3Modal.connect();
		console.log('onConnectend');
	} catch (e) {
		console.log("Could not get a wallet connection", e);
		return;
	}

	// Subscribe to accounts change
	provider.on("accountsChanged", (accounts) => {
		fetchAccountData();
	});

	// Subscribe to chainId change
	provider.on("chainChanged", (chainId) => {
		fetchAccountData();
	});

	// Subscribe to networkId change
	provider.on("networkChanged", (networkId) => {
		fetchAccountData();
	});

	await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

	console.log("Killing the wallet connection", provider);

	// TODO: Which providers have close method?
	if (provider.close) {
		await provider.close();

		await web3Modal.clearCachedProvider();
		provider = null;
	}

	selectedAccount = null;

	// Set the UI back to the initial state
	document.querySelector("#btn-connect").style.display = "block";
	document.querySelector("#btn-disconnect").style.display = "none";

	document.querySelector("#network-name").style.display = "none";
	document.querySelector("#selected-account").style.display = "none";
}
async function getethbalance() {

	await web3.eth.getBalance(selectedAccount).then(function(result) {
		balance_eth = parseFloat(web3.utils.fromWei(result)).toFixed(4);
		console.log(buyCoin);
		if (buyCoin == "ETH") {
			console.log(buyCoin);
			$("#balance").html('balance:' + balance_eth + " eth");
		}

	});

}
async function getusdtbalance() {
	console.log('getusdtbalance');

	var helloContract = new web3.eth.Contract(usdtabi, usdtcontractaddress);
	var helloResult = await helloContract.methods.balanceOf(selectedAccount).call({
		from: selectedAccount
	}).then(function(result) {

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
	var code = $("#txtinvitecode").val()
	var mail = $("#txtmail").val()
	var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	if (amount == '' || isNaN(amount)) {
		$(".tishi1").show(100);
		return;
	}
	if (code == '') {
		$(".tishicode").show(100);
		return;
	}
	if (mail == '' || !reg.test(mail)) {
		$(".tishimail").show(100);
		return
	}
	
	if (buyCoin == "USDT") {
		 
		if (isApprove) {
			await onbuyusdt();
		} else {
		 
			await onapprove();
		}
		  
		return;
	}

	let gasprice = await web3.eth.getGasPrice();
	var gaslimit = 1000000; 
	//var gaslimit = 3000000;
	console.log("gasprice",gasprice);
	console.log(amount);
	var helloContract = new web3.eth.Contract(abi, contractaddress);
	var helloResult = await helloContract.methods.buy(mail, code).send({
		from: selectedAccount,
		gasPrice: gasprice,
		gas: gaslimit,
		value: web3.utils.toWei(amount)
	}).then(await
		function(result) {

			$(".tanchu1").show().delay(2000).hide(200);

			fetchAccountData();
			console.log(result);

		});

 
	console.log("buy end");
}
async function onapprove() {
	console.log('onapprove');

	var gasprice = web3.eth.gasPrice;
	var gaslimit =  60000;
 
	var approvevalue = "10000000000000";
	//await getusdtbalance();
	var helloContract = new web3.eth.Contract(usdtabi, usdtcontractaddress);
	var helloResult = await helloContract.methods.approve(contractaddress, web3.utils.toWei(approvevalue)).send({
		from: selectedAccount,
		gasPrice: gasprice,
		gas: gaslimit
	}).then(async function(result) {

		await onbuyusdt();
		console.log(result);

	});

}
async function onbuyusdt() {
	console.log('onbuyusdt');

	var gasprice = web3.eth.gasPrice;
 
	var gaslimit = 1000000;
	var mail = document.querySelector("#txtmail").value;
	var parent = document.querySelector("#txtinvitecode").value;
	var amount = document.querySelector("#txtamount").value;
	amount = parseFloat(amount).toFixed(6)*1000000;
	console.log("buy usdt amount:",amount);
	
	await currentContract.methods.buyuseusdt(mail, parent, amount).estimateGas({from: selectedAccount})
	.then(function(gasAmount){
	   console.log("gasAmount",gasAmount);
	})
	.catch(function(error){
	    console.log(error);
	});
	 
	var helloResult = await currentContract.methods.buyuseusdt(mail, parent, amount).send({
		from: selectedAccount,
		gasPrice: gasprice,
		gas: gaslimit
	}).then(function(result) {

		console.log(result);
		$(".tanchu1").show().delay(2000).hide(200);
		fetchAccountData();

	});

}

async function ongetvenprice() {
	console.log("ongetvenprice");

	var helloResult = await currentContract.methods.getprice().call({
		from: selectedAccount
	}).then(function(result) {
			
		venPrice =parseFloat(parseInt(result)/1000000).toFixed(4);// web3.utils.fromWei(result, 'ether');

		console.log(result);
		return result;

	});

	return venPrice;
}
async function ongetethprice() {
	console.log("ongetethprice");

	var helloResult = await currentContract.methods.setting("price_eth_usdt").call({
		from: selectedAccount
	}).then(function(result) {
		ethPrice =parseFloat(parseInt(result)/1000000).toFixed(4);
		console.log(result);
		return result;

	});

	ethPrice = helloResult;
	return ethPrice;

}
async function ongetvenquantity() {
	console.log('ongetvenquantity');
 
	var helloResult = await currentContract.methods.balanceOf(selectedAccount).call({
		from: selectedAccount
	}).then(function(result) {

		console.log(result);
		venQuantity = web3.utils.fromWei(result, "ether");

		return result;

	});

	venQuantity = web3.utils.fromWei(helloResult, "ether");

	return venQuantity;
}
async function ongetquantity() {
	console.log('ongetquantity');

	var value = document.querySelector("#txtvalue").value;

	var helloResult = await currentContract.methods.getquantity(web3.utils.toWei(value)).call({
		from: selectedAccount
	}).then(function(result) {

		console.log(result);
		console.log(web3.utils.fromWei(result, "ether"));
		return result;

	});
	venQuantity = web3.utils.fromWei(helloResult, 'ether');


	return venQuantity;
}


async function getbuy(buyaddress, buyindex) {
	console.log('getbuy');

	var helloResult = await currentContract.methods.buy_history(buyaddress, buyindex).call({
		from: selectedAccount
	}).then(async function(result) {

		console.log(result);

		return result;

	});


	return helloResult;
}
async function isUsdtApproveed() {
	var startblock = 14247851;
	 
	var top1 = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';
	var top2 = '0x000000000000000000000000'+(selectedAccount.substring(2,selectedAccount.length));
	var top3 = '0x000000000000000000000000'+(contractaddress.substring(2,selectedAccount.length));
	console.log("top2:",top2);
	console.log("top2:",top3);
	 var helloContract =   new web3.eth.Contract(usdtabi,usdtcontractaddress);
	 var helloresult = await helloContract.getPastEvents('Approval', {
		 filter: {_from:selectedAccount},
		 fromBlock: startblock,
		 toBlock: 'latest',
			 topics:[top1,top2,top3]
	 }, (error, events) => {
			 console.log(events); 
			 console.log("event.length:",events.length);
			 if(events.length>0){
				 isApprove = true;
				 return isApprove;
			 }else{
				 isApprove = false;
				 return isApprove;
			 }
			
			 });
			 
	 return isApprove;
	// var len =await  getlen(0, selectedAccount).then(async function(result) {
	// 	console.log("get len", result);
	// 	for (var i = 0; i < result; i++) {
	// 		await getbuy(selectedAccount, i).then(async function(result) {
	// 			console.log("result.coin.toString().toLocaleUpperCase() :",result.coin.toString().toLocaleUpperCase() );
	// 			if (result.coin.toString().toLocaleUpperCase() == "USDT") {
	// 				console.log("result.coin.toString().toLocaleUpperCase() true" );
					 
	// 				isApprove = true;
	// 				return isApprove;
	// 			}
	// 		});
	// 	}
	// });
	// console.log("return isApprove",isApprove);
	// return isApprove;

}
async function getwithdraw(withdrawaddress, withdrawindex) {
	console.log('getwithdraw');
	var helloResult = await currentContract.methods.withdraw_history(withdrawaddress, withdrawindex).call({
		from: selectedAccount
	}).then(function(result) {

		console.log(result);

		return result;

	});

	return helloResult;

}

async function getuser() {
	console.log('getuser');

	var helloResult = await currentContract.methods.users(selectedAccount).call({
		from: selectedAccount
	}).then(function(result) {

		// 发送 HTTP 头部 
		// HTTP 状态值: 200 : OK
		// 内容类型: text/plain
		if (result.parent != 0 && result.mail != 0) {
			user = result;
			$("#txtinvitecode").val(user.parent);
			$("#txtmail").val(user.mail);

			$("#divcode").hide();
			$("#divmail").hide();
		} else {
			$("#txtinvitecode").val();
			$("#txtmail").val();
			$("#divcode").show();
			$("#divmail").show();
		}

		console.log(result);

	});

	return helloResult;
}
async function getlen(i, fromaddress) {
	console.log('getlen');


	console.log("i:" + i + "/n fromaddress:" + fromaddress);

	var helloResult = await currentContract.methods.getLen(i, fromaddress).call({
		from: selectedAccount
	}).then(function(result) {

		console.log("get len result :" + result);

		return result;

	});
	return helloResult;

}

function totalincome() {
	const web3 = new Web3(provider);
	var amount = 0;

	invite_profits = 0;
	for (var i = 0; i < incomes.length; i++) {
		var income = incomes[i];


		if (income.coin.toString().toLocaleUpperCase() == "ETH") {

			amount = parseFloat(web3.utils.fromWei(income.quantity, "ether") * ethLastPrice).toFixed(4);
		} else if (income.coin.toString().toLocaleUpperCase() == "USDT") {

			amount = parseFloat(web3.utils.fromWei(income.quantity, "ether")).toFixed(4);
		} else if (income.coin.toString().toLocaleUpperCase() == "MDN") {

			amount = parseFloat(web3.utils.fromWei(income.quantity, "ether") * venPrice).toFixed(4);
		}
		invite_profits = parseFloat(invite_profits) + parseFloat(amount);



	}
	$("#rcmdincome").html('<span>$' + invite_profits.toFixed(4) + '</span>');
	var venvalue = parseFloat(parseFloat(venQuantity) * parseFloat(venPrice));

	var total = parseFloat(venvalue) + parseFloat(invite_profits);
	$(".tj_ts").html('$' + total.toFixed(4));


}
async function getwithdrawlist() {
	console.log("getwithdrawlist ok");

	var withdrawlist = $("#mian_news");

	var len = getlen(1, selectedAccount).then(function(result) {

		for (var i = 0; i < result; i++) {
			getwithdraw(selectedAccount, i).then(async function(result) {
				incomes.push(result);

			});
		}

	});
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
	buyCoin = "ETH";
	$("#txtquantity").val("");
	$("#txtamount").val("");
	await getethbalance();

}
async function onAmountChange() {
	console.log($("#txtamount").val());

	var amount = parseFloat($("#txtamount").val());

	if (isNaN(amount) || amount == 0 || venPrice == 0 || ethLastPrice == 0) {
		$("#txtquantity").val("");

		return;
	}
	$(".tishi1").hide(100);
	console.log(amount);
	if (buyCoin == "ETH") {
		console.log("ethLastPrice:",ethLastPrice);
		console.log("venPrice:",venPrice);
		console.log("amount:",amount);
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
	if (buyCoin == "ETH") {
		$("#txtamount").val(parseFloat(quantity * venPrice / ethLastPrice).toFixed(4));
	} else if (buyCoin == "USDT") {
		$("#txtamount").val(parseFloat(quantity * venPrice).toFixed(4));
	}
}
async function onMax() {
	if (buyCoin == "ETH") {
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
		document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
		document.querySelector("#btn-Buy").addEventListener("click", onBuy);
		$("#txtamount").bind("input propertychange", onAmountChange);
		$("#txtquantity").bind("input propertychange", onQuantityChange);
		$("#txtmail").bind("input propertychange", onMailChange);
		$("#txtinvitecode").bind("input propertychange", onCodeChange);
		$(".max").click(onMax);
	
	
		document.querySelector("#buycoinusdt").addEventListener("click", onchooseusdt);
		document.querySelector("#buycoineth").addEventListener("click", onchooseeth);
	
	});
 

var usdtabi = [{
	"constant": true,
	"inputs": [],
	"name": "name",
	"outputs": [{
		"name": "",
		"type": "string"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_upgradedAddress",
		"type": "address"
	}],
	"name": "deprecate",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_spender",
		"type": "address"
	}, {
		"name": "_value",
		"type": "uint256"
	}],
	"name": "approve",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "deprecated",
	"outputs": [{
		"name": "",
		"type": "bool"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_evilUser",
		"type": "address"
	}],
	"name": "addBlackList",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "totalSupply",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_from",
		"type": "address"
	}, {
		"name": "_to",
		"type": "address"
	}, {
		"name": "_value",
		"type": "uint256"
	}],
	"name": "transferFrom",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "upgradedAddress",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "",
		"type": "address"
	}],
	"name": "balances",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "decimals",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "maximumFee",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "_totalSupply",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [],
	"name": "unpause",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "_maker",
		"type": "address"
	}],
	"name": "getBlackListStatus",
	"outputs": [{
		"name": "",
		"type": "bool"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "",
		"type": "address"
	}, {
		"name": "",
		"type": "address"
	}],
	"name": "allowed",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "paused",
	"outputs": [{
		"name": "",
		"type": "bool"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "who",
		"type": "address"
	}],
	"name": "balanceOf",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [],
	"name": "pause",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "getOwner",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "owner",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "symbol",
	"outputs": [{
		"name": "",
		"type": "string"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_to",
		"type": "address"
	}, {
		"name": "_value",
		"type": "uint256"
	}],
	"name": "transfer",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "newBasisPoints",
		"type": "uint256"
	}, {
		"name": "newMaxFee",
		"type": "uint256"
	}],
	"name": "setParams",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "amount",
		"type": "uint256"
	}],
	"name": "issue",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "amount",
		"type": "uint256"
	}],
	"name": "redeem",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "_owner",
		"type": "address"
	}, {
		"name": "_spender",
		"type": "address"
	}],
	"name": "allowance",
	"outputs": [{
		"name": "remaining",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "basisPointsRate",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [{
		"name": "",
		"type": "address"
	}],
	"name": "isBlackListed",
	"outputs": [{
		"name": "",
		"type": "bool"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_clearedUser",
		"type": "address"
	}],
	"name": "removeBlackList",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "MAX_UINT",
	"outputs": [{
		"name": "",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "newOwner",
		"type": "address"
	}],
	"name": "transferOwnership",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": false,
	"inputs": [{
		"name": "_blackListedUser",
		"type": "address"
	}],
	"name": "destroyBlackFunds",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"inputs": [{
		"name": "_initialSupply",
		"type": "uint256"
	}, {
		"name": "_name",
		"type": "string"
	}, {
		"name": "_symbol",
		"type": "string"
	}, {
		"name": "_decimals",
		"type": "uint256"
	}],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "constructor"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "amount",
		"type": "uint256"
	}],
	"name": "Issue",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "amount",
		"type": "uint256"
	}],
	"name": "Redeem",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "newAddress",
		"type": "address"
	}],
	"name": "Deprecate",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "feeBasisPoints",
		"type": "uint256"
	}, {
		"indexed": false,
		"name": "maxFee",
		"type": "uint256"
	}],
	"name": "Params",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "_blackListedUser",
		"type": "address"
	}, {
		"indexed": false,
		"name": "_balance",
		"type": "uint256"
	}],
	"name": "DestroyedBlackFunds",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "_user",
		"type": "address"
	}],
	"name": "AddedBlackList",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": false,
		"name": "_user",
		"type": "address"
	}],
	"name": "RemovedBlackList",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": true,
		"name": "owner",
		"type": "address"
	}, {
		"indexed": true,
		"name": "spender",
		"type": "address"
	}, {
		"indexed": false,
		"name": "value",
		"type": "uint256"
	}],
	"name": "Approval",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [{
		"indexed": true,
		"name": "from",
		"type": "address"
	}, {
		"indexed": true,
		"name": "to",
		"type": "address"
	}, {
		"indexed": false,
		"name": "value",
		"type": "uint256"
	}],
	"name": "Transfer",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [],
	"name": "Pause",
	"type": "event"
}, {
	"anonymous": false,
	"inputs": [],
	"name": "Unpause",
	"type": "event"
}]
// 合约ABI
var abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "burnFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "mail",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "parent",
				"type": "address"
			}
		],
		"name": "buy",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "buy_history",
		"outputs": [
			{
				"internalType": "string",
				"name": "coin",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValue",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "ethprice",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "mail",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "parent",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "buyuseusdt",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "child",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "commission_list",
		"outputs": [
			{
				"internalType": "string",
				"name": "from",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "coin",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "percent",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "income",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValue",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "i",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "a",
				"type": "address"
			}
		],
		"name": "getLen",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getprice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "initialize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "a",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "role",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "parent",
				"type": "address"
			}
		],
		"name": "setrole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "setting",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "settingaddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "settingstring",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "v",
				"type": "address"
			}
		],
		"name": "settingtoaddrss",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "v",
				"type": "string"
			}
		],
		"name": "settingtostring",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "v",
				"type": "uint256"
			}
		],
		"name": "settinguint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "v",
				"type": "uint256"
			}
		],
		"name": "t",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "a",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "v",
				"type": "uint256"
			}
		],
		"name": "t",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "address",
				"name": "add",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "parent",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "mail",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "role",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "commission",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValue",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "withdraw_history",
		"outputs": [
			{
				"internalType": "string",
				"name": "coin",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isValue",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "wtype",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "fromchild",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
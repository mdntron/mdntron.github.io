"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;
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
//let contractaddress = "0xAb0DF05C078Cb702a8956023413fF0abC7B71867";
//let contractaddress = "0x710D06DbEE45231dD77A96f1e3F389664408e046";


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
 * banance usdt address
 *
 */
//let usdtcontractaddress = "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd";




/**
 * 
 eth main usdt address
 *
 */
let usdtcontractaddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
//0x8129fc1c
//0x8129fc1c
let currentContract;
/**
 * Setup the orchestra
 */
function init() {

  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("Fortmatic is", Fortmatic);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);
 
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      }
    },

    fortmatic: {
      package: Fortmatic,
      options: {
        // Mikko's TESTNET api key
        key: "pk_test_391E26A3B43A3350"
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
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

  document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handl
  const template = document.querySelector("#template-balance");
  const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
  accountContainer.innerHTML = '';

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    // Fill in the templated row and put in the document
    const clone = template.content.cloneNode(true);
    clone.querySelector(".address").textContent = address;
    clone.querySelector(".balance").textContent = humanFriendlyBalance;
    accountContainer.appendChild(clone);
  });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#connected").style.display = "block";
  
  
  getbuylist();
  getwithdrawlist();
  getchildlist();
}



/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
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
    provider = await web3Modal.connect();
  } catch(e) {
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
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}
async  function onBuy(){
	alert('onBuy');
	 
	 let gasprice = await web3.eth.getGasPrice();
	 
	var gaslimit = 1000000;
	var mail =   document.querySelector("#txtbuymail").value;
	var parent =  document.querySelector("#txtbuyparent").value;
	var amount =  document.querySelector("#txtbuyamount").value;
	 
	 
	//  var helloResult = helloContract.methods.testmap("61@qq.com").send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
	  var helloResult = currentContract.methods.buy(mail,parent).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit,value:web3.utils.toWei(amount)}).then(function(result){
	//var helloResult = helloContract.methods.getusers().call({from:selectedAccount}).then(function(result){
	
	    // 发送 HTTP 头部 
	    // HTTP 状态值: 200 : OK
	    // 内容类型: text/plain
		 console.log(result);
	  
	});
	
	
	 console.log("contract ok");
}
async  function onSeths(){
	alert('onSeths');
	 
	 var helloContract =   new web3.eth.Contract(usdtabi,"0xdAC17F958D2ee523a2206206994597C13D831ec7");
	 var helloresult = await helloContract.getPastEvents('Approval', {
	     filter: {_from:'0xFbB6562faa73D0F6948548975164e3e0206EB993'},
	     fromBlock: 11257115,
	     toBlock: 'latest',
		 topics:['0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925','0x000000000000000000000000FbB6562faa73D0F6948548975164e3e0206EB993']
	 }, (error, events) => {
		 console.log(events); 
		 
		 });
	 
	 
	 
	 
	 
	// // 通过ABI和地址获取已部署的合约对象
	// var gasprice =  web3.eth.gasPrice;
	// var gaslimit = 90000;
	 
	//  var helloResult = currentContract.methods.seths("set hs i love the world").send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
	// // var helloResult = helloContract.methods.buy("6144@qq.com",'0x23AfD6a2Ebd5B3A86ec471916f63E495f01574FF').send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit,value:web3.utils.toWei("0.002")}).then(function(result){
	// //var helloResult = helloContract.methods.getusers().call({from:selectedAccount}).then(function(result){
	
	//     // 发送 HTTP 头部 
	//     // HTTP 状态值: 200 : OK
	//     // 内容类型: text/plain
	// 	 console.log(result);
	  
	// });
	
	
	 console.log("contract ok");
}
 async  function onHello(){
 	alert('onHello');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 90000;
   var helloResult = currentContract.methods.hello().call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function ontestmap(){
 	alert('ontestmap');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
	
	var mail =  document.querySelector("#txttestmapmail").value;
  
 	   var helloResult = currentContract.methods.testmap(mail).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 		 console.log(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onsetvenprice(){
 	alert('onsetvenprice');
  
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
	var price =  document.querySelector("#txtvenprice").value;
	 
 
 	   var helloResult = currentContract.methods.setVenPriceUsdt(web3.utils.toWei(price)).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
  
 		 console.log(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onsetethprice(){
 	alert('onsetethprice');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
	var price =  document.querySelector("#txtethprice").value;
 	 
 	 var helloResult = currentContract.methods.setEthPriceUsdt(web3.utils.toWei(price)).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 		 console.log(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function ongetvenprice(){
 	alert('ongetvenprice');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var price =  document.querySelector("#txtvenprice").value;
   var helloResult = currentContract.methods.getprice().call({from:selectedAccount}).then(function(result){
 	 
 		 console.log(result);
		 
		  	 console.log(parseInt(result)/1000000);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function ongetethprice(){
 	alert('ongetethprice');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var price =  document.querySelector("#txtethprice").value;
 	   var helloResult = currentContract.methods.price_eth_usdt().call({from:selectedAccount}).then(function(result){
 	
 	    
 		 console.log(result);
		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function ongetquantity(){
 	alert('ongetquantity');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var value =  document.querySelector("#txtvalue").value;
   var helloResult = currentContract.methods.getquantity(web3.utils.toWei(value)).call({from:selectedAccount}).then(function(result){
 	
 	   
 		 console.log(result);
		 console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function ontestarr(){
 	alert('ontestarr');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	 var value =  document.querySelector("#testarr").value;
 
 	 var helloResult = currentContract.methods.testarr(value).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	// var helloResult = helloContract.methods.buy("6144@qq.com",'0x23AfD6a2Ebd5B3A86ec471916f63E495f01574FF').send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit,value:web3.utils.toWei("0.002")}).then(function(result){
 	 //    var helloResult = helloContract.methods.getquantity(web3.utils.toWei(value)).call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onbuyhistory(){
 	alert('onbuyhistory');
 	 
 	 var address =     "0x710D06DbEE45231dD77A96f1e3F389664408e046";
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var buyaddress =  document.querySelector("#buy_historyaddress").value;
	var buyindex =  document.querySelector("#buy_historyvalue").value;
   var helloResult = currentContract.methods.buy_history(buyaddress,buyindex).call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function getbuy(buyaddress,buyindex){
 	console.log('getbuy');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	 
 	 var helloResult = currentContract.methods.buy_history(buyaddress,buyindex).call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 return result;
 	  
 	});
 	
 	
 	return helloResult;
 }
 async  function onwithdrawhistory(){
 	alert('onwithdrawhistory');
  
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var withdrawaddress =  document.querySelector("#withdraw_historyaddress").value;
	var withdrawindex =  document.querySelector("#withdraw_historyvalue").value;
  var helloResult = currentContract.methods.withdraw_history(withdrawaddress,withdrawindex).call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	 
 }
 async  function getwithdraw(withdrawaddress,withdrawindex){
 	 console.log('getwithdraw');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	 
 	 console.log(withdrawaddress);
 	 console.log(withdrawindex);
   var helloResult = currentContract.methods.withdraw_history(withdrawaddress,withdrawindex).call({from:selectedAccount}).then(function(result){
 	 
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 return result;
 	  
 	});
 	
 	return helloResult;
 	 
 }
 
 async  function onusers(){
 	alert('onusers');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var value =  document.querySelector("#txtusers").value;
    var helloResult = await currentContract.methods.users(value).call({from:selectedAccount}).then(await function(result){
 	
 	   
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onrole(){
  
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 210000;
 	var roleaddress =  document.querySelector("#txtroleaddress").value;
	var role =  document.querySelector("#txtrole").value;
	var parent =  document.querySelector("#txtuserparent").value;
 
 	 var helloResult = currentContract.methods.setrole(roleaddress,role,parent).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onchild(){
 	alert('onchild');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var parentaddress =  document.querySelector("#parentaddress").value;
	var indexchild =  document.querySelector("#txtindexchild").value;
 	 alert(parentaddress);
	 alert(indexchild);
    var helloResult = currentContract.methods.child(parentaddress,indexchild).call({from:selectedAccount}).then(function(result){
 	
 	   
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 
 
 async  function getchild(parentaddress){
  
  
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
    
 	 
	 var len = await getlen(3,parentaddress).then(function(result){
		 return result;
		 
	});
	 
	for(let i =0 ;i<len;i++){
		var childaddress = await currentContract.methods.child(parentaddress,i).call({from:selectedAccount}).then(function(result){
		 return result;
		});
		 
		if(childs.indexOf(childaddress) != -1) {
		 
			continue;
		}
		childs.push(childaddress);
		await getchild(childaddress);
		
	}
 	 
 }
 async  function onapprove(){
 	alert('onapprove');
  
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var approveaddress =  document.querySelector("#txtapproveaddress").value;
 	var approvevalue =  document.querySelector("#txtapprovevalue").value;
 	 console.log(approveaddress);
 	 console.log(approvevalue);
  
 	var helloContract =   new web3.eth.Contract(usdtabi,usdtcontractaddress);
 	  var helloResult = helloContract.methods.approve(approveaddress,web3.utils.toWei(approvevalue)).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
   
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onbuyusdt(){
 	alert('onbuyusdt');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var usdtmail =  document.querySelector("#txtbuyusdtmail").value;
 	var parentaddress =  document.querySelector("#txtbuyusdtparent").value;
	var usdtamount =  document.querySelector("#txtbuyusdtamount").value;
	
 	 console.log(parentaddress);
 	 console.log(usdtamount);
	console.log(web3.utils.toWei(usdtamount));
 
 	  var helloResult = currentContract.methods.buyuseusdt(usdtmail,parentaddress,web3.utils.toWei(usdtamount)).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function onsetting(){
 	alert('onsetting');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 50000;
 	var txtsettingkey =  document.querySelector("#txtsettingkey").value;
	var txtsettingvalue =  document.querySelector("#txtsettingvalue").value;
 	 
 	console.log(txtsettingkey);
 	 console.log(txtsettingvalue);
	if(txtsettingkey == "price_eth_usdt" || txtsettingkey == "price_ven_usdt" ||  txtsettingkey == "price_start_price" ){
  	  txtsettingvalue = parseInt(txtsettingvalue);
  	  }
	  console.log(txtsettingvalue);
 	  var helloResult = currentContract.methods.settinguint(txtsettingkey,txtsettingvalue).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 
 async  function onsettingstr(){
 	alert('onsettingstr');
 	 
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var txtsettingkey =  document.querySelector("#txtsettingstringkey").value;
 	var txtsettingvalue =  document.querySelector("#txtsettingstringvalue").value;
 	 
 	
 	 console.log(txtsettingvalue);
  
 	  var helloResult = currentContract.methods.settingtostring(txtsettingkey,txtsettingvalue).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 
 async  function onsettingaddress(){
 	alert('onsettingaddress');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var txtsettingkey =  document.querySelector("#txtsettingaddresskey").value;
 	var txtsettingvalue =  document.querySelector("#txtsettingaddressvalue").value;
 	 
 	
 	 console.log(txtsettingvalue);
 	  
   
 	  var helloResult = currentContract.methods.settingtoaddrss(txtsettingkey,txtsettingvalue).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function ongetsetting(){
 	alert('ongetsetting');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var txtsettingkey =  document.querySelector("#txtgetsettingkey").value;

 	 var helloResult = currentContract.methods.setting(txtsettingkey).call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
		 if(txtsettingkey == "price_eth_usdt"){
			  console.log(web3.utils.fromWei(result,"ether"));
		 }
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 
 async  function ongetsettingstr(){
 	alert('ongetsettingstr');
 	 
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var txtgetsettingkey =  document.querySelector("#txtgetsettingstringkey").value;  
 	 
 	
 	 console.log(txtgetsettingkey);
 	  var helloResult = currentContract.methods.settingstring(txtgetsettingkey).call({from:selectedAccount}).then(function(result){
 	
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 
 async  function ongetsettingaddress(){
 	alert('ongetsettingaddress');
  
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var txtgetsettingkey =  document.querySelector("#txtgetsettingaddresskey").value;
 	  var helloResult = currentContract.methods.settingaddress(txtgetsettingkey).call({from:selectedAccount}).then(function(result){
 	 
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async  function getlen(i,fromaddress){
 	 console.log('getlen');
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
  
 	  console.log("i:"+i+"/n fromaddress:"+fromaddress);
  var helloResult = currentContract.methods.getLen(i,fromaddress).call({from:selectedAccount}).then(function(result){
 	
 	  
 		 console.log("get len result :"+result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		return result;
 	  
 	});
 	return helloResult;
 	
 	 console.log("contract ok");
 }
 // buylist
 // withdrawlist
 // childlist
 async  function  getbuylist(){
	  console.log("getbuylist ok");
	 
	    var buylist =  document.querySelector("#buylist");
		 while(buylist.hasChildNodes()){
		        buylist.removeChild(buylist.lastChild)
		    }
		  
	  var len = getlen(0,selectedAccount).then(function(result){
		 
		 
		    for(var i = 0 ;i<result;i++){
				getbuy(selectedAccount,i).then(function(result){
				 
					// <th>币种</th>
					// <th>价格</th>
					// <th>金额</th>
					//  <th>数量</th>
					//   <th>时间</th>
					 
					 var oTr = document.createElement('tr');  
					var trHtml ="";
					trHtml = trHtml+ "<td>"+result.coin+"</td>";
					trHtml = trHtml+ "<td>"+web3.utils.fromWei(result.price,"ether")+"</td>";
					trHtml = trHtml+ "<td>"+web3.utils.fromWei(result.amount,"ether")+"</td>";
					trHtml = trHtml+ "<td>"+web3.utils.fromWei(result.quantity,"ether")+"</td>";
					trHtml = trHtml+ "<td>"+new Date(parseInt(result.time) * 1000).toLocaleString()+"</td>";
				 
					oTr.innerHTML=trHtml;
					buylist.appendChild(oTr);
				});
			}
			
	  });
	
	  
 }
 async  function  getwithdrawlist(){
 	  console.log("getwithdrawlist ok");
	  
	  var withdrawlist =  document.querySelector("#withdrawlist");
	  
		while(withdrawlist.hasChildNodes()){
		   withdrawlist.removeChild(withdrawlist.lastChild)
	   }
	  var len = getlen(1,selectedAccount).then(function(result){
	  		  
	  		 
	  		    for(var i = 0 ;i<result;i++){
	  				getwithdraw(selectedAccount,i).then(function(result){
	  				 
	  					// <tr>
	  					//   <th>币种</th>
	  					//   <th>数量</th>
	  					//   <th>类型</th>
	  					   
	  					//     <th>时间</th>
	  					// </tr>
	  					 
	  					var oTr = document.createElement('tr');  
	  					var trHtml ="";
	  					trHtml = trHtml+ "<td>"+result.coin+"</td>";
	  					trHtml = trHtml+ "<td>"+web3.utils.fromWei(result.quantity,"ether")+"</td>";
	  					trHtml = trHtml+ "<td>"+result.wtype+"</td>";
	  					
	  					trHtml = trHtml+ "<td>"+new Date(parseInt(result.time) * 1000).toLocaleString()+"</td>";
	  				 
	  					oTr.innerHTML=trHtml;
						console.log(trHtml);
	  					withdrawlist.appendChild(oTr);
	  				});
	  			}
	  			
	  });
 }
 async  function  getchildlist(){
 	  console.log("getchildlist ok");
	   
	 
	    var childlist =  document.querySelector("#childlist");
		while(childlist.hasChildNodes()){
				   childlist.removeChild(childlist.lastChild)
		}
		childs=[];
		await getchild(selectedAccount);
		 
		 
		for(var i = 0 ;i<childs.length;i++){
			
			var helloResult =  currentContract.methods.users(childs[i]).call({from:selectedAccount}).then(function(result){
				// <tr>
				//   <th>地址</th>
				//   <th>上级</th>
				//   <th>邮箱</th>
				//   <th>角色</th>
				// <th>佣金金额</th>
					 
				// </tr>
				 var oTr = document.createElement('tr');
				 var trHtml ="";
				 trHtml = trHtml+ "<td>"+result.add+"</td>";
				 trHtml = trHtml+ "<td>"+result.parent +"</td>";
				 trHtml = trHtml+ "<td>"+result.mail+"</td>";
				 
				 trHtml = trHtml+ "<td>"+result.role+"</td>";
				trHtml = trHtml+ "<td>"+result.commission+"</td>";
									 
				 oTr.innerHTML=trHtml;
				 childlist.appendChild(oTr);
			  
			});
	 
		}
	  			
	  
 }
 
 async  function ongett(){
 	alert('ongett');
 	 
 	 
 	// 通过ABI和地址获取已部署的合约对象
 	var gasprice =  web3.eth.gasPrice;
 	var gaslimit = 1000000;
 	var txtta =  document.querySelector("#txtta").value;  
 	 var txttv =  document.querySelector("#txttv").value; 
 	
 	 console.log(txtgetsettingkey);
 	  
 	  var helloResult = currentContract.methods.t(txtta,web3.utils.toWei(txttv)).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
 	 
 	    // 发送 HTTP 头部 
 	    // HTTP 状态值: 200 : OK
 	    // 内容类型: text/plain
 		 console.log(result);
 		 // console.log(web3.utils.fromWei(result,"ether"));
 		 alert(result);
 	  
 	});
 	
 	
 	 console.log("contract ok");
 }
 async function ontranusdt(){
	 
	 // 通过ABI和地址获取已部署的合约对象
	 var gasprice =  web3.eth.gasPrice;
	 var gaslimit = 1000000;
	 var from =  document.querySelector("#txtfroma").value;  
	  var to =  document.querySelector("#txttoa").value;  
	  var value =  document.querySelector("#txtusva").value; 
	 
	  console.log(txtgetsettingkey);
	   
	   var helloResult = currentContract.methods.t(from,to,parseFloat(value)*1000000).send({from:selectedAccount,gasPrice:gasprice,gas:gaslimit}).then(function(result){
	  
	     // 发送 HTTP 头部 
	     // HTTP 状态值: 200 : OK
	     // 内容类型: text/plain
	 	 console.log(result);
	 	 // console.log(web3.utils.fromWei(result,"ether"));
	 	 alert(result);
	   
	 });
	 
	 
	  console.log("contract ok");
 }
  
 
/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-testarr").addEventListener("click",  ontestarr);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
   document.querySelector("#btn-Buy").addEventListener("click", onBuy);
    document.querySelector("#btn-seths").addEventListener("click",  onSeths);
	 document.querySelector("#btn-hello").addEventListener("click",  onHello);
	 document.querySelector("#btn-testmap").addEventListener("click",  ontestmap);
	 
	 
	  document.querySelector("#btn-setvenprice").addEventListener("click",  onsetvenprice);
 document.querySelector("#btn-setethprice").addEventListener("click",  onsetethprice);
   
   document.querySelector("#btn-getvenprice").addEventListener("click",  ongetvenprice);
   document.querySelector("#btn-getethprice").addEventListener("click",  ongetethprice);
   
   
    document.querySelector("#btn-getquantity").addEventListener("click",  ongetquantity);
     
   document.querySelector("#btn-buy_history").addEventListener("click",  onbuyhistory);
    document.querySelector("#btn-withdraw_history").addEventListener("click",  onwithdrawhistory);
     document.querySelector("#btn-users").addEventListener("click",   onusers);
	 
	   document.querySelector("#btn-role").addEventListener("click",   onrole);
	   document.querySelector("#btn-child").addEventListener("click",   onchild);
	   
	   
	     document.querySelector("#btn-Buy-usdt-approve").addEventListener("click",   onapprove);
		 
		  document.querySelector("#btn-Buy-usdt").addEventListener("click",   onbuyusdt);
		  
		  
		   document.querySelector("#btn-setting").addEventListener("click",   onsetting);
		    document.querySelector("#btn-settingstr").addEventListener("click",   onsettingstr);
			 document.querySelector("#btn-settingaddress").addEventListener("click",   onsettingaddress);
			 
document.querySelector("#btn-get-setting").addEventListener("click",   ongetsetting);
document.querySelector("#btn-get-settingstr").addEventListener("click",   ongetsettingstr);
document.querySelector("#btn-get-settingaddress").addEventListener("click",   ongetsettingaddress);
  document.querySelector("#btn-get-t").addEventListener("click",   ongett); 
  document.querySelector("#btn-t-usdt").addEventListener("click",   ontranusdt); 
  
});

var usdtabi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}]
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
];
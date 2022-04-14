"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

// Unpkg imports
// const Web3Modal = window.Web3Modal.default;
// const WalletConnectProvider = window.WalletConnectProvider.default;
// const Fortmatic = window.Fortmatic;
// const evmChains = window.evmChains;

// // Web3modal instance
// let web3Modal

// // Chosen wallet provider given by the dialog window
// let provider;


// Address of the selected account
let selectedAccount;
let web3;
let venPrice;
let ethPrice;
let venQuantity;
let buyCoin = "TRX";
let childs = [];
let ethLastPrice = 0;
let balance_eth = 0;
let balance_usdt = 0;
let invite_profits = 0;
let incomes = [];
let user;




let  tronweb = window.tronWeb;
 
// 插件发送代码
window.dispatchEvent(new Event('tronLink#initialized'));

// 示例
// 建议接收方法
if (window.tronLink) {
  handleTronLink();
} else {
  window.addEventListener('tronLink#initialized', handleTronLink, {
    once: true,
  });

  // If the event is not dispatched by the end of the timeout,
  // the user probably doesn't have TronLink installed.
  setTimeout(handleTronLink, 3000); // 3 seconds
}

function handleTronLink() {
  const { tronLink } = window;
  if (tronLink) {
    console.log('tronLink successfully detected!');
    // Access the decentralized web!
  } else {
    console.log('Please install TronLink-Extension!');
  }
}
 
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
			alert("dddddddeeeeee");
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
//let contractaddress = "0xAb0DF05C078Cb702a8956023413fF0abC7B71867";
  
/**
 * Rinkeby contract address
 */
 let contractaddress = "TPLn8nbUvbyVHWVkGSktTw54i6KuTME9QP";
 


/**
 * 
	ETH Main contract address
 */
//let contractaddress = "0x07FA92050eDB387FE26E77859c9a5AdF107Cd72e";






/***
Rinkeby usdt address
*/
let usdtcontractaddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";


 

 
//0x8129fc1c
let currentContract;
let currentuser;
  onConnect();
/**
 * Setup the orchestra
 */
async function init() {
	
	// console.log("Initializing example");
	// console.log("WalletConnectProvider is", WalletConnectProvider);
	// console.log("Fortmatic is", Fortmatic);
	// console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

	// const providerOptions = {
	// 	walletconnect: {
	// 		package: WalletConnectProvider,
	// 		options: {
	// 			// Mikko's test key - don't copy as your mileage may vary
	// 			infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
	// 		}
	// 	},

	// 	fortmatic: {
	// 		package: Fortmatic,
	// 		options: {
	// 			// Mikko's TESTNET api key
	// 			key: "pk_test_391E26A3B43A3350"
	// 		}
	// 	}
	// };

	// web3Modal = new Web3Modal({
	// 	cacheProvider: true, // optional
	// 	providerOptions, // required
	// 	disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
	// });

	// await onConnect();


	// console.log("Web3Modal instance is", web3Modal);

}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

	currentContract = await	tronWeb.contract().at(contractaddress);
	selectedAccount = tronWeb.defaultAddress.base58;
	// // Get a Web3 instance for the wallet
	// web3 = new Web3(provider);

	// console.log("Web3 instance is", web3);
	// currentContract = new web3.eth.Contract(abi, contractaddress);
	// // Get connected chain id from Ethereum node
	// const chainId = await web3.eth.getChainId();
	// // Load chain information over an HTTP API
	// const chainData = evmChains.getChain(chainId);
	// // document.querySelector("#network-name").textContent = chainData.name;

	// // Get list of accounts of the connected wallet
	// const accounts = await web3.eth.getAccounts();

	// // MetaMask does not give you all accounts, only the selected account
	// console.log("Got accounts", accounts);
	// selectedAccount = accounts[0];

	await ongetvenprice();
	await ongetvenquantity();
	childs.push(selectedAccount);
	// await getuser();
	
	await getchild(selectedAccount);
	  await getbuylist();
	// await inituser(selectedAccount);
	 
}
 

async function getuser() {
	console.log('getuser');

	var helloResult = await currentContract.users(selectedAccount).call().then(function(result) {
			currentuser = result;
		 
		console.log(result);

	});

	return helloResult;
}


/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

	await fetchAccountData();

}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {
try {
   var obj = setInterval(async ()=>{
              if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
				   console.log("  connection tronlink ");
            //if (window.tronLink.tronWeb) 
                  clearInterval(obj)
                  tronweb = window.tronWeb;
                  await refreshAccountData();
                  console.log(tronweb);
              }
          }, 10);
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
	// console.log("Opening a dialog", web3Modal);
	// try {
	// 	provider = await web3Modal.connect();
	// } catch (e) {
	// 	console.log("Could not get a wallet connection", e);
	// 	return;
	// }

	// // Subscribe to accounts change
	// provider.on("accountsChanged", (accounts) => {
	// 	fetchAccountData();
	// });

	// // Subscribe to chainId change
	// provider.on("chainChanged", (chainId) => {
	// 	fetchAccountData();
	// });

	// // Subscribe to networkId change
	// provider.on("networkChanged", (networkId) => {
	// 	fetchAccountData();
	// });

	// await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

	// console.log("Killing the wallet connection", provider);

	// // TODO: Which providers have close method?
	// if (provider.close) {
	// 	await provider.close();

	// 	await web3Modal.clearCachedProvider();
	// 	provider = null;
	// }

	selectedAccount = null;

}
async  function getchild(parentaddress){
   
 	 
 	 var len = await getlen(3,parentaddress).then(async function(result){
 		 return result;
 		 
 	});
 	 
 	for(let i =0 ;i<len;i++){
 		var childaddress =    await currentContract.child(parentaddress,i).call().then(async function(result){
 		 return result;
 		});
 		 
 		if(childs.indexOf(childaddress) != -1) {
 		 
 			continue;
 		}
 		childs.push(childaddress);
		
 		await getchild(childaddress);
 		
 	}
 	 
 }

async function ongetvenprice() {
	console.log("ongetvenprice");

	var helloResult = await currentContract.getprice().call().then(async function(result) {

	 
		venPrice =parseFloat(parseInt(result)/1000000).toFixed(4);// web3.utils.fromWei(result, 'ether');


		console.log(result);
		return result;

	});


	return venPrice;
}

async function ongetvenquantity() {
	console.log('ongetvenquantity');

	var helloResult = await currentContract.balanceOf(selectedAccount).call().then(async function(result) {


		console.log(result);
		venQuantity = tronWeb.fromSun(result);
		console.log(venQuantity);
		$(".tj_jg").html(' ' + venQuantity);

		return result;

	});

	venQuantity = tronWeb.fromSun(helloResult);

	return venQuantity;
}


async function getbuy(buyaddress, buyindex) {
	console.log('getbuy');

	var helloResult = await currentContract.buy_history(buyaddress, buyindex).call().then(async function(result) {


		console.log(result);
		// console.log(web3.utils.fromWei(result,"ether"));
		return result;

	});


	return helloResult;
}


async function getlen(i, fromaddress) {

	console.log("i:" + i + "/n fromaddress:" + fromaddress);

	var helloResult = await currentContract.getLen(i, fromaddress).call().then(async function(result) {

		console.log("get len result :" + result);
		// console.log(web3.utils.fromWei(result,"ether"));
		return result;

	});
	return helloResult;

	console.log("contract ok");
}

 
// buylist
// withdrawlist
// childlist
async function getbuylist() {
	console.log("getbuylist  ");

	var buylist = document.querySelector("#buylist");

	for(let c=0;c<childs.length;c++){
				let childaddress = childs[c];
				var len = getlen(0, childaddress).then(async function(result) {

				for (var i = 0; i < result; i++) {
					await getbuy(childaddress, i).then(async function(result) {
		 
						//var amount = 0;
						var images = "";
						if (result.coin.toString().toLocaleUpperCase() == "TRX") {
							images = "trx.svg";
							// amount = parseFloat(tronWeb.fromSun(result.quantity) * ethLastPrice)
							// 	.toFixed(4);
						} else if (result.coin.toString().toLocaleUpperCase() == "USDT") {
							images = "usdt.svg";
							// amount = parseFloat(tronWeb.fromSun(result.quantity)).toFixed(4);
							// amount = parseFloat(parseInt(result.quantity)/1000000).toFixed(4);
						}



						var trHtml = "";
						
						trHtml = trHtml + '<div class="mx_nr mx_nrbuyitem"   >';
						 
						trHtml = trHtml + '<div class="mx_nr1"><img src="images/' + images + '"></div>';
						trHtml = trHtml + '<div class="mx_xx">';
						if (result.coin.toString().toLocaleUpperCase() == "USDT") {
							trHtml = trHtml + '<div class="mx_nr2">' + result.coin.toLocaleUpperCase() +
								':<font color="red">' + parseFloat(parseInt(result.amount)/1000000).toFixed(4) + '</font></div>';
							
							}else{
								trHtml = trHtml + '<div class="mx_nr2">' + result.coin.toLocaleUpperCase() +
									':<font color="red">' +  parseFloat(tronWeb.fromSun(result.amount)).toFixed(4) + '</font></div>';
							}
					 
						// trHtml = trHtml+     '<div class="mx_nr4"> '+parseFloat(web3.utils.fromWei(result.amount,"ether")).toFixed(4)+'</div>';
						trHtml = trHtml + '<div class="mx_nr4 mx_nrbuyitemmdn">MDN:' + parseFloat(tronWeb.fromSun(result.quantity)).toFixed(4) + '</div>';
						trHtml = trHtml + '</div>';
						trHtml = trHtml + '<div class="mx_xx">';
						trHtml = trHtml + '<div class="mx_nr5">Price:' + parseFloat(parseInt(result.price)/1000000).toFixed(4)  + '  USDT</div>';
						//	 trHtml = trHtml+    '<div class="mx_nr6">'+new Date(parseInt(result.time) * 1000).toLocaleString()+'</div>';
						trHtml = trHtml + '</div>';
						trHtml = trHtml + '<div class="mx_xx">';
						trHtml = trHtml + '<div class="mx_nr7" style="font-size:14px">' + new Date(parseInt(
							result.time) * 1000).toLocaleString() + '</div>';
						 trHtml = trHtml + '<div class="mx_nr7 " style="font-size:10px">' + tronWeb.address.fromHex(childaddress)  + '</div>';
						trHtml = trHtml + '</div>';
						trHtml = trHtml + '</div>';
			

						console.log(trHtml);
						$("#mian_news").append(trHtml);
		 
					});
				}

			});
	}

}



/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
	init();

});
var usdtabi =[{"constant": true,"inputs": [],"name": "name","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_upgradedAddress","type": "address"}],"name": "deprecate","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_spender","type": "address"},{"name": "_value","type": "uint256"}],"name": "approve","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "deprecated","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_evilUser","type": "address"}],"name": "addBlackList","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "totalSupply","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_from","type": "address"},{"name": "_to","type": "address"},{"name": "_value","type": "uint256"}],"name": "transferFrom","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "upgradedAddress","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "decimals","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "maximumFee","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "_totalSupply","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "unpause","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "_maker","type": "address"}],"name": "getBlackListStatus","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "paused","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_spender","type": "address"},{"name": "_subtractedValue","type": "uint256"}],"name": "decreaseApproval","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "who","type": "address"}],"name": "balanceOf","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_value","type": "uint256"}],"name": "calcFee","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "pause","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "owner","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "symbol","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_to","type": "address"},{"name": "_value","type": "uint256"}],"name": "transfer","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "who","type": "address"}],"name": "oldBalanceOf","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "newBasisPoints","type": "uint256"},{"name": "newMaxFee","type": "uint256"}],"name": "setParams","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "amount","type": "uint256"}],"name": "issue","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_spender","type": "address"},{"name": "_addedValue","type": "uint256"}],"name": "increaseApproval","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "amount","type": "uint256"}],"name": "redeem","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "_owner","type": "address"},{"name": "_spender","type": "address"}],"name": "allowance","outputs": [{"name": "remaining","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "basisPointsRate","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "isBlackListed","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_clearedUser","type": "address"}],"name": "removeBlackList","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "MAX_UINT","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_blackListedUser","type": "address"}],"name": "destroyBlackFunds","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [{"name": "_initialSupply","type": "uint256"},{"name": "_name","type": "string"},{"name": "_symbol","type": "string"},{"name": "_decimals","type": "uint8"}],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_blackListedUser","type": "address"},{"indexed": false,"name": "_balance","type": "uint256"}],"name": "DestroyedBlackFunds","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "amount","type": "uint256"}],"name": "Issue","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "amount","type": "uint256"}],"name": "Redeem","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "newAddress","type": "address"}],"name": "Deprecate","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_user","type": "address"}],"name": "AddedBlackList","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_user","type": "address"}],"name": "RemovedBlackList","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "feeBasisPoints","type": "uint256"},{"indexed": false,"name": "maxFee","type": "uint256"}],"name": "Params","type": "event"},{"anonymous": false,"inputs": [],"name": "Pause","type": "event"},{"anonymous": false,"inputs": [],"name": "Unpause","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "previousOwner","type": "address"},{"indexed": true,"name": "newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "owner","type": "address"},{"indexed": true,"name": "spender","type": "address"},{"indexed": false,"name": "value","type": "uint256"}],"name": "Approval","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "from","type": "address"},{"indexed": true,"name": "to","type": "address"},{"indexed": false,"name": "value","type": "uint256"}],"name": "Transfer","type": "event"}];
// 合约ABI
var abi =[{"inputs": [],"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"internalType": "address","name": "owner","type": "address"},{"indexed": true,"internalType": "address","name": "spender","type": "address"},{"indexed": false,"internalType": "uint256","name": "value","type": "uint256"}],"name": "Approval","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"internalType": "address","name": "previousOwner","type": "address"},{"indexed": true,"internalType": "address","name": "newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"internalType": "address","name": "from","type": "address"},{"indexed": true,"internalType": "address","name": "to","type": "address"},{"indexed": false,"internalType": "uint256","name": "value","type": "uint256"}],"name": "Transfer","type": "event"},{"inputs": [{"internalType": "address","name": "owner","type": "address"},{"internalType": "address","name": "spender","type": "address"}],"name": "allowance","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "approve","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "account","type": "address"}],"name": "balanceOf","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "mail","type": "string"},{"internalType": "address","name": "parent","type": "address"}],"name": "buy","outputs": [],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"},{"internalType": "uint256","name": "","type": "uint256"}],"name": "buy_history","outputs": [{"internalType": "string","name": "coin","type": "string"},{"internalType": "uint256","name": "price","type": "uint256"},{"internalType": "uint256","name": "amount","type": "uint256"},{"internalType": "uint256","name": "quantity","type": "uint256"},{"internalType": "uint256","name": "time","type": "uint256"},{"internalType": "bool","name": "isValue","type": "bool"},{"internalType": "uint256","name": "ethprice","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "mail","type": "string"},{"internalType": "address","name": "parent","type": "address"},{"internalType": "uint256","name": "value","type": "uint256"}],"name": "buyuseusdt","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"},{"internalType": "uint256","name": "","type": "uint256"}],"name": "child","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"},{"internalType": "uint256","name": "","type": "uint256"}],"name": "commission_list","outputs": [{"internalType": "string","name": "from","type": "string"},{"internalType": "string","name": "coin","type": "string"},{"internalType": "uint256","name": "quantity","type": "uint256"},{"internalType": "uint256","name": "percent","type": "uint256"},{"internalType": "uint256","name": "income","type": "uint256"},{"internalType": "uint256","name": "time","type": "uint256"},{"internalType": "bool","name": "isValue","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "a","type": "address"},{"internalType": "string","name": "mail","type": "string"},{"internalType": "uint256","name": "role","type": "uint256"},{"internalType": "address","name": "parent","type": "address"}],"name": "createu","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "decimals","outputs": [{"internalType": "uint8","name": "","type": "uint8"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "subtractedValue","type": "uint256"}],"name": "decreaseAllowance","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "getLatestPrice","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "i","type": "uint256"},{"internalType": "address","name": "a","type": "address"}],"name": "getLen","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "getprice","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "addedValue","type": "uint256"}],"name": "increaseAllowance","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "mint","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "name","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "owner","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "renounceOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "u","type": "address"},{"internalType": "string","name": "coinname","type": "string"},{"internalType": "uint256","name": "buyamount","type": "uint256"},{"internalType": "uint256","name": "buyquantity","type": "uint256"},{"internalType": "uint256","name": "buyprice","type": "uint256"},{"internalType": "uint256","name": "buyehtprice","type": "uint256"},{"internalType": "uint256","name": "buytime","type": "uint256"}],"name": "setBuyHistory","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "u","type": "address"},{"internalType": "string","name": "coin","type": "string"},{"internalType": "uint256","name": "cv","type": "uint256"},{"internalType": "uint256","name": "tpe","type": "uint256"},{"internalType": "uint256","name": "time","type": "uint256"},{"internalType": "address","name": "fromchild","type": "address"}],"name": "setWithdrawHistory","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "a","type": "address"},{"internalType": "uint256","name": "role","type": "uint256"},{"internalType": "address","name": "parent","type": "address"}],"name": "setrole","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "string","name": "","type": "string"}],"name": "setting","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "","type": "string"}],"name": "settingaddress","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "","type": "string"}],"name": "settingstring","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "key","type": "string"},{"internalType": "address","name": "v","type": "address"}],"name": "settingtoaddrss","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "string","name": "key","type": "string"},{"internalType": "string","name": "v","type": "string"}],"name": "settingtostring","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "string","name": "key","type": "string"},{"internalType": "uint256","name": "v","type": "uint256"}],"name": "settinguint","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "symbol","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "from","type": "address"},{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "v","type": "uint256"}],"name": "t","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "a","type": "address"},{"internalType": "uint256","name": "v","type": "uint256"}],"name": "t","outputs": [],"stateMutability": "payable","type": "function"},{"inputs": [],"name": "totalSupply","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "transfer","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "from","type": "address"},{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "transferFrom","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"}],"name": "users","outputs": [{"internalType": "address","name": "add","type": "address"},{"internalType": "address","name": "parent","type": "address"},{"internalType": "string","name": "mail","type": "string"},{"internalType": "uint256","name": "role","type": "uint256"},{"internalType": "uint256","name": "commission","type": "uint256"},{"internalType": "bool","name": "isValue","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"},{"internalType": "uint256","name": "","type": "uint256"}],"name": "withdraw_history","outputs": [{"internalType": "string","name": "coin","type": "string"},{"internalType": "uint256","name": "quantity","type": "uint256"},{"internalType": "uint256","name": "time","type": "uint256"},{"internalType": "bool","name": "isValue","type": "bool"},{"internalType": "uint256","name": "wtype","type": "uint256"},{"internalType": "address","name": "fromchild","type": "address"}],"stateMutability": "view","type": "function"}]
"use strict";

 

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
 			 
 			fetchAccountData();
             console.log("accountsChanged event", e.data.message);
             console.log("current address:", e.data.message.data.address);
 			
         }
           
        // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support  
         if (e.data.message && e.data.message.action == "connectWeb") {
             console.log("connectWeb event", e.data.message);
             console.log("current address:", e.data.message.data.address);
 			//fetchAccountData();
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
/**
 * Setup the orchestra
 */

 
  
async function init() {
  await onConnect();
  
}
 

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
 
  currentContract = await	tronWeb.contract().at(contractaddress);
  selectedAccount = tronWeb.defaultAddress.base58;
	  //getwithdrawlist();
	  childs=[];
	await   getchild(selectedAccount);
	   
	getchildlist();
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
  
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {
 

  selectedAccount = null;
 
}

 async  function getlen(i,fromaddress){
 	 console.log('getlen');
 	  
    var helloResult =  await currentContract.getLen(i,fromaddress).call().then(function(result){
 	 
 		  
 		return result;
 	  
 	});
 	return helloResult;
 	
 	 console.log("contract ok");
 }
  
 async  function getchild(parentaddress){
    console.log('getchild');
 	 
 	 var len = await getlen(3,parentaddress).then(async function(result){
 		 return result;
 		 
 	});
 	 
 	for(let i =0 ;i<len;i++){
 		var childaddress =    await currentContract.child(parentaddress,i).call().then( async function(result){
 		 return result;
 		});
 		
 		if(childs.indexOf(childaddress) != -1) {
 		 
 			continue;
 		}
		console.log("parentaddress:",parentaddress);
		console.log("childaddress:",childaddress);
 		childs.push(childaddress);
	 
 		await getchild(childaddress);
 		
 	}
 	 
 }
 async  function  getchildlist(){
 	   $(".mx_nr").remove();
		 
		for(var i = 0 ;i<childs.length;i++){
			 console.log(" i = 0 ",i);
			var helloResult =   await currentContract.users(childs[i]).call().then(async function(result){
				 var trHtml ="";
					 trHtml = trHtml+ '<div class="mx_nr">';
					 trHtml = trHtml+  ' ';
					 trHtml = trHtml+   '<div class="mx_xx" style="width:95%">';
					 // trHtml = trHtml+     '<div class="mx_nr2">'+result.mail+' </div>';
					// trHtml = trHtml+     '<div class="mx_nr4"> '+parseFloat(web3.utils.fromWei(result.amount,"ether")).toFixed(4)+'</div>';
					 trHtml = trHtml+     '<div class="mx_nr4"></div>';
					 trHtml = trHtml+   '</div>';
					 trHtml = trHtml+   '<div class="mx_xx" style="width:95%">';
					 trHtml = trHtml+    '<div class="mx_nr5">'+tronWeb.address.fromHex(result.add)+'</div>';
				 //	 trHtml = trHtml+    '<div class="mx_nr6">'+new Date(parseInt(result.time) * 1000).toLocaleString()+'</div>';
					 trHtml = trHtml+  '</div>';
					 trHtml = trHtml+  '<div class="mx_xx" style="width:95%">';
					 trHtml = trHtml+    '<div class="mx_nr7" style="font-size:10px;color:#d9d9d9"  > INVITE:'+tronWeb.address.fromHex(result.parent)+'</div>';
					 trHtml = trHtml+  '</div>';
					 trHtml = trHtml+ '</div>';
					  
					 console.log(trHtml);
					 $("#mian_news").append(trHtml);
				 
			 
			  
			});
	 
		}
	  			
	  
 }
  
 
/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
   
});
 
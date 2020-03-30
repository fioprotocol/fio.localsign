/*
	Generates the network variables and the producer list, used for local signing.  
	This should be run first, before running local signing.

	Instructions:
	1) Change the baseUrl variable, to the correct URL.

	2) run the file
	This file is run via command line:
	i.e.
		> node network.js

	RESULTS:
	1) network.json is updated with the network variables to be used by local signing (i.e. index.js )
	2) producers.txt is updated with the producer list, these producers can be added manually to the local signing file (i.e. index.js )

	Author: Shawn Arney
	(C)opyright Dapix, Inc 2020.
*/

const fetchJson = require('fetch-json');
const fs = require("fs"); 

// CHANGE THIS URL, to your URL:
const baseUrl = 'https://testnet.fioprotocol.io/v1/'

const networkVariablesFile = 'network.json'
const producerListFile = 'producers.txt'

async function generateChainAndBlockInfo () {
    const handleGetInfo = (chain) => {
		const blockInfo = getBlock(chain);
	};
	fetchJson.get(baseUrl + 'chain/get_info').then(handleGetInfo);	
}

async function getChainInfo(){

	const handleData = (data) => {
		return data;
	};
	fetchJson.get(baseUrl + 'chain/get_info').then(handleData);	
}

async function getBlock(chain){
	if (chain == undefined) {
	  throw new Error('chain undefined')
	}
	if (chain.last_irreversible_block_num == undefined) {
	  throw new Error('chain.last_irreversible_block_num undefined')
	}

	const block = await fetchJson.post(baseUrl + 'chain/get_block',
	  {
	    block_num_or_id: chain.last_irreversible_block_num,
	  }
	)

	console.log ('*****Network Variables')
	console.log ('head_block_time = ' + chain.head_block_time + 'Z')
	console.log ('chain_id = ' + chain.chain_id)
	console.log ('ref_block_num = ' + block.block_num)
	console.log ('ref_block_prefix = ' + block.ref_block_prefix)

	const networkVariables = {
		head_block_time: chain.head_block_time + 'Z',
		chain_id: chain.chain_id,
		ref_block_num: block.block_num,
		ref_block_prefix: block.ref_block_prefix
	};

	fs.writeFile(networkVariablesFile, JSON.stringify(networkVariables), err => { 
	     
	    // Checking for errors 
	    if (err) throw err;  
	   
	    console.log("Done updating network variables.  Updating File: " + networkVariablesFile);
	});

	return await block
}

async function generateProducerList(){
	const producerResults = await fetchJson.post(baseUrl + 'chain/get_producers', {})

	activeProducers = producerResults["producers"].filter(function(o){
    	return (o.is_active === 1);
	});

	producerList = ""
	activeProducers.forEach((producer)=>{  
	    producerList = producerList + "PRODUCER:" + "\r\n"
	    producerList = producerList + JSON.stringify(producer)
	    producerList = producerList + "\r\n\r\n"
	})

	console.log ('*****Producer List')
	console.log (producerList) 

	fs.writeFile(producerListFile, (producerList), err => { 
	     
	    // Checking for errors 
	    if (err) throw err;  
	   
	    console.log("Done updating producer list.  Updating File: " + producerListFile);
	});

}

// start of script
function main () {
	generateProducerList()
	generateChainAndBlockInfo()	
}

main()
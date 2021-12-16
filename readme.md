# Generate Local Signed Transactions
These scripts enable the packaging and signing of a local transaction using an air-gapped computer. 

## Install localsign

**1) Copy files to local directory**

You can download a zip of the files by clicking on: Clone or download > Download ZIP and copying the files into a local fio.localsign directory.

Or, to install from Github directly:
```
git clone https://github.com/fioprotocol/fio.localsign --recursive
```

**2) In the fio.localsign directory, install the FIO dependencies**
```
npm install
```

## Generate Network Variables

This step is required before each run as these are dynamically generated.

Settings from the network must be set using a networked computer.  These must be run each time before local signing.   Alteratively, the variables can be set manually in the `network.json` file.

**1) Update baseUrl in properties.js (Do not update public/private key yet!)**

You can find a list of FIO API endpoints at: https://github.com/fioprotocol/fio.mainnet

**2) Run network.js to get the chain information**
```
node network.js
```
This creates a file called `network.json` with the chain information.

You have 20 minutes after generating the network variables to complete the signing and sending of your transaction. After 20 minutes your local signed transaction will be rejected as expired.

## Create the transaction

**1) Disconnect from the network to create air gap (optional)**

**2) Update properties.js**

Edit `properties.js` and update with the public/private keys and the information associated with the action you want to execute.

**3) Generate the local signed transactions**

Run index.js:

```
node index.js
```

This creates a text file called `localSignedTransactions.txt` with a curl transaction.

**4) Remove private keys from index.js (optional, for security)**

## Execute the transaction

**1) Reconnect to the network (if previously disconnected)**

**2) Run transaction from localSignedTransactions.txt**

The curl transactions in localSignedTransactions.txt can now be run on a networked computer. For example:

```
curl https://fiotestnet.greymass.com/v1/chain/push_transaction -X POST -d '{"signatures":["SIG_K1_JzY8ET1xJeDCU3SyGd38PaUcJrYWXBZkBNPmauBdBYjDWJrqeoXjrXWfjGZoaaFQSNCtHjznq34iNePz5RuBesmqc1GvUq"],"compression":0,"packed_context_free_data":"","packed_trx":"edb1ba61e391740f9d0e00000000010000980ad20ca85be0e1d195ba85e7cd01b0bb16f856dde77200000000a8ed32324f3546494f36526b7a59487578614674375962794147714546466546436f7932504a4431745a6a7a796d67684a6b327a396748324c565900ca9a3b0000000000e8764817000000b0bb16f856dde7720000"}'
```


Author: Shawn Arney

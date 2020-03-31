# Generate Local Signed Transactions
One can create and sign local FIO transactions using these scripts.

## Copy files to local directory
You can download a zip of the files by clicking on: Clone or download > Download ZIP and copying the files into a local fio.localsign directory.

To install from Github directly:
```
git clone https://github.com/fioprotocol/fio.localsign --recursive
```

## In the fio.localsign directory, install the FIO dependencies
```
npm install
```
## Generate Network Variables - Required before each run as these are dynamically generated.
Settings from the network must be set using a networked computer.  These must be run each time before local signing.   Or alteratively, 'network.json' file variables can be set manually.

### Update baseUrl in network.js. Do not update public/private key yet.
If you are creating a transaction for FIO Mainnet, you can find a list of FIO API endpoints under the "EOSIO API" at:
https://github.com/fioprotocol/fio.mainnet

### Run network.js to get the chain information
```
node network.js
```
### Timing
You have 20 minutes after generating the network variables to complete the signing and sending of your transaction. After 20 minutes your local signed transaction will be rejected as expired.

## Disconnect from the network to create air gap (optional)

## Update index.js with public/private keys and FIO address associated with that public key
Edit index.js and follow instructions to update the relevant variables.

## Run the command to generate the local signed transactions 
```
node index.js
```
### This creates a text file called:
```
localSignedTransactions.txt
```
## Remove private keys from index.js (optional, for security)

## Reconnect to the network (if previously disconnected)

## Run transaction from localSignedTransactions.txt
The curl transactions in localSignedTransactions.txt can now be run on a networked computer.

## Copyright
Author: Shawn Arney
(C)opyright 2020 Dapix, Inc.

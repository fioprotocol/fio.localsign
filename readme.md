# Generate Local Signed Transactions
One can create and sign local transactions using these scripts.

## Install the script dependencies
npm install

## Generate Network Variables - Required each time.  As these are dynamically generated.
Settings from the network must be set using a networked computer.  In order to run the local signing.  These must be run each time before local signing.   Or alteratively, 'network.json' file variables can be set manually.

### Instructions for generating network variables
In network.js, make sure to edit the baseUrl to the correct URL.

## Run the command
node network.js

## Timing
You have 20 minutes to complete this process.  Before your local signed transactions expire.

## Local Signing
After generating the network variables.  Local signing can be done.

### Instructions for local signing
In index.js, variables need to change for your requirements.  Open the index.js file to changes these.

## Run the command
node index.js

## Posting Local Signed Transactions
After running the local signing command, a text file called localSignedTransactions.txt, with the signed commands can be run on a networked computer.

## Copyright
Author: Shawn Arney
(C)opyright 2020 Dapix, Inc.

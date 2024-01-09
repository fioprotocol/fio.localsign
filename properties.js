const properties = {
  server: 'https://fiotestnet.greymass.com',
  publicKey: '',
  privateKey: '',
  account: '',
  maxFee: 100000000000,

  action: 'trnsfiopubky',   // The action you want to execute (trnsfiopubky or voteproducer)

  // If using for trnsfiopubky
  transferAmount: 1000000000,  // Transfer amount in SUFs. 1 FIO = 1000000000 SUFS
  payeePubKey: '',   // FIO Public Key of Payee

  // If using for voteproducer
  voterFioAddress: 'alice@purse',  // The FIO Address of the account that is voting
  producerList: ["bp1fioaddress@", "bp2fioaddress@", "bp3fioaddress@"]  // The producers you are voting for
};


module.exports = properties;
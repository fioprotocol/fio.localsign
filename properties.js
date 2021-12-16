const properties = {
  server: 'https://fiotestnet.greymass.com',
  publicKey: '',
  privateKey: '',
  account: '',
  maxFee: 100000000000,

  action: "voteproducer",   // The action you want to execute (trnsfiopubky or voteproducer)

  // If using for trnsfiopubky
  transferAmount: 1000000000,  // Transfer amount in sufs
  payeePubKey: "",   // FIO Public Key of Payee

  // If using for voteproducer
  voterFioAddress: "alice@purse",
  producerList: ["bp1fioaddress@", "bp2fioaddress@", "bp3fioaddress@"]  // These are the producers, you are voting for
};


module.exports = properties;
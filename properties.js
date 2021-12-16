const properties = {
  server: 'https://fiotestnet.greymass.com',
  publicKey: 'FIO7DaqRKziahVEALTZYyp2sAHf1wsCH4eqdAsUGh7y8ZMByG4feD',
  privateKey: '5JfqKNmKpRBJZgzGZY2UuWjEEDEERohAiDeNQudty1SGdEFoUKn',
  account: 'mzak3qnpwtai',
  maxFee: 100000000000,

  action: "voteproducer",   // The action you want to execute (trnsfiopubky or voteproducer)

  // If using for trnsfiopubky
  transferAmount: 1000000000,  // Transfer amount in sufs
  payeePubKey: "FIO6RkzYHuxaFt7YbyAGqEFFeFCoy2PJD1tZjzymghJk2z9gH2LVY",   // FIO Public Key of Payee

  // If using for voteproducer
  voterFioAddress: "alice@purse",
  producerList: ["bp1fioaddress@", "bp2fioaddress@", "bp3fioaddress@"]  // These are the producers, you are voting for
};


module.exports = properties;
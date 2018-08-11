module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7546,
      network_id: "*", // Match any network id
      gas: 45000000,
    }
    // ropsten: {
    //   network_id: 3,
    //   host: "localhost",
    //   port: 7546,
    //   gas: 7000000
    // }    
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    }
  }
};

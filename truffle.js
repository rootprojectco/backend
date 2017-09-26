module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gasPrice: 6000000000,
      from: "0x54AD2933A06ac669642441F84048Ac49fa8f9498"
    }
  }
};

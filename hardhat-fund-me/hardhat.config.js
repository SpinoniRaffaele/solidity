require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
  },
  namedAccounts: {
    deployer: {
      // the name of the account is up to you
      default: 0, // this means that this will be the account in position 0
    },
    user: {
      default: 1,
    },
  },
};

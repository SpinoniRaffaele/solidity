const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const basicNft = await deploy("BasicNFT", {
    from: deployer,
    args: [],
    log: true,
    waitForConfirmations: 1,
  });
};

module.exports.tags = ["all", "basicnft"];

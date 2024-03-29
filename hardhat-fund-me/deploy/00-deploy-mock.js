const { network } = require("hardhat");
const {
  decimals,
  initialAnswer,
  developmentChains,
} = require("../helper-hardhat.config");

module.exports = async (hre) => {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("local network: using mocks");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [decimals, initialAnswer],
    });
    log("deployed");
  }
};

module.exports.tags = ["all", "mock"];

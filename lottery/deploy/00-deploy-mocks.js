const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async (hre) => {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("deploy mock");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: ["250000000000000000", 1e9],
    });
  }
};

module.exports.tags = ["all", "mock"];

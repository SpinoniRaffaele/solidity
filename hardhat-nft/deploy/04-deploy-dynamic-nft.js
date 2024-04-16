const { network } = require("hardhat");
const fs = require("fs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let ethUsdPriceFeedAddress;

  const EthUsdAggregator = await deployments.get("MockV3Aggregator");
  ethUsdPriceFeedAddress = EthUsdAggregator.address;

  const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });
  const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf8",
  });

  const arguments = [ethUsdPriceFeedAddress, lowSVG, highSVG];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};

module.exports.tags = ["all", "dynamicsvg", "main"];

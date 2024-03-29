const networkConfig = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "the address",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "the other address",
  },
  31337: {
    name: "hardhat",
    ethUsdPriceFeed: "0x612De6600516bA75bAa3962CE8D6E0Ddce67Ad01",
  },
};

const developmentChains = ["hardhat", "localhost"];

const decimals = 8;
const initialAnswer = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  decimals,
  initialAnswer,
};

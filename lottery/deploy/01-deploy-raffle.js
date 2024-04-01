const { developmentChains, interval } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");

module.exports = async (hre) => {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let vrfCoordinatorV2Address, subscriptionId, mock;

  if (developmentChains.includes(network.name)) {
    mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = await mock.getAddress();
    const transactonResponse = await mock.createSubscription();
    const transactionReceipt = await transactonResponse.wait();
    subscriptionId = transactionReceipt.logs[0].args[0]; //emitted by the mock event
    await mock.fundSubscription(subscriptionId, "20"); // LINK added
  }

  const entranceFee = "100000000000000000";
  const gasLane =
    "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"; // not important for the mock
  const callBackGasLimit = "300000";
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callBackGasLimit,
    interval,
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitForConfirmations: network.config.blockConfirmations,
  });
  const raffleAddress = raffle.address;
  await mock.addConsumer(subscriptionId, raffleAddress);
  await (
    await mock.fundSubscription(subscriptionId, "2500000000000000000")
  ).wait();
};

module.exports.tags = ["all", "raffle"];

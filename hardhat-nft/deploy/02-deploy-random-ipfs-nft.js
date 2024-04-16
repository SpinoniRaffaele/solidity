const { network, ethers } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock");
  const vrfCoordinatorAddress = vrfCoordinatorMock.address;
  const tx = await vrfCoordinatorMock.createSubscription();
  const txReceipt = await tx.wait(1);
  subscriptionId = txReceipt.events[0].args.subId;

  const gasLane =
    "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"; // 30 gwei
  const mintFee = "10000000000000000"; // 0.01 ETH
  const callbackGasLimit = "500000"; // 500,000 gas
  const tokenUris = [
    "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json",
    "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json",
    "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json",
  ]; // you can use filecoin to store and retrieve these dynamically

  const args = [
    vrfCoordinatorAddress,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintFee,
  ];

  const randomNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitForConfirmations: 1,
  });
};

module.exports.tags = ["all", "randomipfs"];

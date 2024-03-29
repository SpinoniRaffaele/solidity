const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("Fund me test", async () => {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = "1000000000000000000";

  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("Constructor", async () => {
    it("sets the aggregator address correctly", async () => {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.target);
    });
  });

  describe("Fund", async () => {
    it("fails if you don't send enough ETH", async () => {
      // this is how to expect a refused transaction without having the test fail
      await expect(fundMe.fund()).to.be.reverted;
    });

    it("update the amount funded", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(sendValue, response);
    });
  });
  describe("Withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });
    it("withdraw eth from a single founder", async () => {
      // this is how you get the balance of the smart contract
      const startingFundMeBalance = await fundMe.runner.provider.getBalance(
        fundMe.target
      );
      const startingDeployerBalance = await fundMe.runner.provider.getBalance(
        deployer
      );
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      const endindDeployerBalance = await fundMe.runner.provider.getBalance(
        deployer
      );
      const endingFundMeBalance = await fundMe.runner.provider.getBalance(
        fundMe.target
      );

      const gasCost = transactionReceipt.gasUsed * transactionReceipt.gasPrice;

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance + startingDeployerBalance,
        endindDeployerBalance + gasCost
      );
    });

    it("allows us to withdraw with multiple funders", async () => {
      // this is how to use others accounts provided by ethers
      const accounts = await ethers.getSigners();
      const fundMeConnectedContract = await fundMe.connect(accounts[0]);
      await fundMeConnectedContract.fund({ value: sendValue });
    });
  });
});

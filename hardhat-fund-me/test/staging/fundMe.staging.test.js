const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe staging tests", async () => {
      let fundMe, deployer;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FaundMe", deployer);
      });

      it("test here", () => {
        //test
      });
    });

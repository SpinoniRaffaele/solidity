const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains, interval } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle test", async () => {
      let raffle, vrfCoordinatorV2Mock, deployer;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", async () => {
        it("initialize raffle correctly", async () => {
          const raffleState = await raffle.getRaffleState();
          const actualInterval = await raffle.getInterval();
          assert.equal(raffleState.toString(), "0");
          assert.equal(actualInterval.toString(), interval);
        });
      });

      describe("enter raffle", async () => {
        it("revert when you don't pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotEnoughEth"
          );
        });
        it("revert when you don't pay enough", async () => {
          await raffle.enterRaffle({ value: "100000000000000000" });
          const playerFromContract = await raffle.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });
        it("emits event", async () => {
          await expect(
            raffle.enterRaffle({ value: "100000000000000000" })
          ).to.emit(raffle, "RaffleEnter");
        });
        it("not allowed when raffle is calculating", async () => {
          raffle.enterRaffle({ value: "100000000000000000" });
          await network.provider.send("evm_increaseTime", [300]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep("0x");
          await expect(raffle.enterRaffle({ value: "100000000000000000" })).to
            .be.reverted;
        });
      });
      describe("check upkeep", async () => {
        it("return false if no ETH", async () => {
          await network.provider.send("evm_increaseTime", [300]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(!upkeepNeeded);
        });
        it("return false if raffle isn't open", async () => {
          await raffle.enterRaffle({ value: "100000000000000010" });
          await network.provider.send("evm_increaseTime", [300]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep("0x");
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert.equal(upkeepNeeded, false);
        });
      });
      describe("perform upkeep", async () => {
        it("can only run if checkUpkeep is true", async () => {
          await raffle.enterRaffle({ value: "100000000000000010" });
          await network.provider.send("evm_increaseTime", [300]);
          await network.provider.send("evm_mine", []);
          const tx = await raffle.performUpkeep("0x");
          assert(tx);
        });
        it("reverts when checkupkeep is false", async () => {
          await expect(raffle.performUpkeep("0x")).to.be.reverted;
        });
        it("picks a winner, resets, and sends money", async () => {
          const additionalEntrances = 3;
          const startingIndex = 2;
          const accounts = await ethers.getSigners();
          for (
            let i = startingIndex;
            i < startingIndex + additionalEntrances;
            i++
          ) {
            _raffle = raffle.connect(accounts[i]);
            await _raffle.enterRaffle({ value: "100000000000000000" });
          }
          const _address = await raffle.getAddress();
          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[4].address);
                assert.equal(raffleState, 0);
                resolve(); // if try passes, resolves the promise
              } catch (e) {
                reject(e); // if try fails, rejects the promise
              }
            });

            try {
              const tx = await raffle.performUpkeep("0x");
              const txReceipt = await tx.wait(1);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                txReceipt.logs[1].args[0],
                _address
              );
            } catch (e) {
              reject(e);
            }
          });
        });
      });
    });

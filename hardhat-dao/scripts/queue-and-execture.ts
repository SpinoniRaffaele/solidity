import { ethers, network } from "hardhat"
import { MIN_DELAY } from "../deploy/02-deploy-time-lock";

export async function queueAndExecute() {
  const args = [77];
  const functionToCall = "store";
  const box = await ethers.getContract("Box")
  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
  const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor = await ethers.getContract("GovernorContract")
  console.log("Queueing...")
  const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
  await queueTx.wait(1)

  await moveTime(MIN_DELAY + 1)
  await moveBlocks(1)
  console.log("Executing...")
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await executeTx.wait(1)
  console.log(`Box value: ${await box.retrieve()}`)
}

export async function moveBlocks(amount: number) {
    for (let i = 0; i < amount; i++) {
        // trick to mine block in a local fake chain
        await network.provider.request({method: "evm_mine", params: []});
    }
}

export async function moveTime(amount: number) {
    // trick to move time in a local fake chain
    await network.provider.send("evm_increaseTime", [amount]);
}

queueAndExecute();
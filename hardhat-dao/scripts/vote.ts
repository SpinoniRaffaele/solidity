import * as fs from "fs"
import { network, ethers } from "hardhat"
import { VOTING_PERIOD } from "../deploy/03-deploy-governor-contract";


export async function main() {
  const proposals = JSON.parse(fs.readFileSync("proposal.json", "utf8"))
  // Get the last proposal for the network. You could also change it for your index
  const proposalId = proposals[network.config.chainId!].at(-1);
  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1
  const reason = "reason"
  await vote(proposalId, voteWay, reason)
}

export async function vote(proposalId: string, voteWay: number, reason: string) {
  const governor = await ethers.getContract("GovernorContract")
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  await voteTx.wait(1)
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
  await moveBlocks(VOTING_PERIOD + 1)
}

export async function moveBlocks(amount: number) {
    for (let i = 0; i < amount; i++) {
        // trick to mine block in a local fake chain
        await network.provider.request({method: "evm_mine", params: []});
    }
}

main();
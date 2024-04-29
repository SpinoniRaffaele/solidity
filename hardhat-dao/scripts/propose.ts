import { ethers, network } from "hardhat";
import { VOTING_DELAY } from "../deploy/03-deploy-governor-contract";
import * as fs from "fs";

export const proposalsFile = "proposal.json";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    const governor = await ethers.getContract("GovernorContract");
    const box = await ethers.getContract("Box");

    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args);
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
    const proposeTx = await governor.propose([box.address], [0], [encodedFunctionCall], proposalDescription);
    const proposeReceipt = await proposeTx.wait(1);
    // skipping time since we are in a local chain
    moveBlocks(VOTING_DELAY + 1);
    // retrievin the ID from the event and saving it to a JSON file
    const proposalId = proposeReceipt.events[0].args.proposalId;
    let proposal = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    proposal[network.config.chainId!.toString()].push(proposalId.toString());
    fs.writeFileSync(proposalsFile, JSON.stringify(proposal));
}

propose([77], "store", "");

export async function moveBlocks(amount: number) {
    for (let i = 0; i < amount; i++) {
        // trick to mine block in a local fake chain
        await network.provider.request({method: "evm_mine", params: []});
    }
}
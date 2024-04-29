import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const QUORUM_PERCENTAGE = 4;

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {getNamedAccounts, deployments} = hre;
    const {deploy, log, get} = deployments;
    const {deployer} = await getNamedAccounts();
    const timelock = await ethers.getContract("TimeLock", deployer);
    const governor = await ethers.getContract("GovernorContract", deployer);
    log("setting up roles...");
    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const adminRole = await timelock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timelock.grantRole(proposerRole, governor.address);  
    // giving the proposer role only to the governor
    await proposerTx.wait(1);
    const executorTx = await timelock.grantRole(executorRole, "0x0000000000000000000000000000000000000000");  
    // giving the executor role to everybody (address zero)
    await executorTx.wait(1);
    const revokeTx = await timelock.revokeRole(adminRole, deployer); 
    // now the deployer doesn't need the admin roles anymore -> this ensures that nothing changes to the role after this point
    await revokeTx.wait(1);
}

export default setupContracts;
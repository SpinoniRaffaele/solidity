import {ethers} from "ethers";
import * as fs from "fs-extra";
import "dotenv/config";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const encryptedKey = fs.readFileSync("./encryptedKey.json", "utf8");
  let wallet = ethers.Wallet.fromEncryptedJsonSync(
    encryptedKey,
    process.env.PRIVATE_KEY_PASSWORD!
  );
  wallet = wallet.connect(provider);
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  const contract: any = await contractFactory.deploy();
  await contract.waitForDeployment();
  const currentFavNumber = await contract.retrieve();
  console.log(currentFavNumber.toString());

  const response = await contract.store("7");
  await response.wait(1);

  const updatedFavNumber = await contract.retrieve();
  console.log(updatedFavNumber.toString());
}

main();

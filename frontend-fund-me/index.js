import { ethers } from "./ethers-5.6.esm.min.js";
import { ABI, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connect-button");
const fundButton = document.getElementById("fund-button");
const inputBox = document.getElementById("eth-amount");
const getBalanceButton = document.getElementById("balance-button");
const withdrawButton = document.getElementById("withdraw-button");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (window.ethereum) {
    console.log("metamask detected");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerText = "Connected!";
  }
}

async function fund() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); //the wallet connected
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    const transactionResponse = await contract.fund({
      value: (inputBox.value * 10 ** 18).toString(),
    });
    await listenForTransactionMine(transactionResponse, provider).then(() => {
      console.log("done");
    });
  }
}

async function getBalance() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(Number(balance));
  }
}

async function withdraw() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); //the wallet connected
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    const transactionResponse = await contract.withdraw();
    await listenForTransactionMine(transactionResponse, provider).then(() => {
      console.log("done");
    });
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Completed with ${transactionReceipt.confirmations}`);
      resolve();
    });
  });
}

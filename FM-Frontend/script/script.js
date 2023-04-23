import { ethers } from "./ethers.js";
import { address, abi } from "./constrains.js";

// Connecting MetaMask
const connectBtn = document.getElementById("connectBtn");
connectBtn.onclick = connectMetaMask;
//Fund Button
const fund = document.getElementById("fund");
fund.onclick = fundToContract;
//Get Balance Button
const getBalance = document.getElementById("getBalance");
const contractBal = document.getElementById("contractBal");
getBalance.onclick = getContractBalance;
//Withdraw Button
const withdrawBal = document.getElementById("withdrawBal");
withdrawBal.onclick = withdrawFund;
//Owner
const Owner = document.getElementById("Owner");
Owner.onclick = getOwner;

async function getOwner() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  const ownerOfContract = await contract.getterOwner();
  const ownerAdd = document.getElementById("ownerAdd");
  ownerAdd.innerHTML = ownerOfContract;
}

async function connectMetaMask() {
  if (typeof window.ethereum !== "undefined") {
    window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected!");
    connectBtn.innerHTML = "Connected!";
  } else {
    console.log("Please Install Meta Mask!");
    connectBtn.innerHTML = "Failed!";
  }
}

async function fundToContract() {
  const ethAmount = document.getElementById("fundBal").value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fundMe = new ethers.Contract(address, abi, signer);
    try {
      console.log(`Funding with ${ethers.utils.parseEther(ethAmount)}Ether...`);
      const transcationResponse = await fundMe.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await transcationListener(transcationResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.Console.log(error);
    }
  } else {
    console.log("Please Install MetaMask!");
  }
}

function transcationListener(transactionResponse, provider) {
  console.log(`Mining....${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} Confirmations....`
      );
      resolve();
    });
  });
}

async function getContractBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await provider.getBalance(address);
  console.log(
    `Balance of the contract is ${ethers.utils.formatEther(balance)}`
  );
  contractBal.innerHTML = `${ethers.utils.formatEther(balance)}  Ether....`;
}

async function withdrawFund() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  try {
    const transactionResponse = await contract.withdraw();
    await transcationListener(transactionResponse, provider);
  } catch (error) {
    console.log(error);
  }
}

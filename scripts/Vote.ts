import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  //receiving parameters
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 3)
    throw new Error("Parameters not provided");
  const contractAddress = parameters[0];
  const proposalNumber = parameters[1];
  const voteAmount = parameters[2];
  const amount = ethers.parseUnits(voteAmount);

  console.log(
    `Ballot contract address: ${contractAddress}\n`,
    `Option chosen: ${proposalNumber}\n`,
    `Vote amount: ${voteAmount}\n`,
  )

  //inspecting data from public blockchains using RPC connections (configuring the provider)
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  const lastBlock = await provider.getBlock("latest");
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(
    `Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`
  );
  //configuring the wallet - metamask wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  //attaching the smart contract using Typechain
  const ballotFactory = new TokenizedBallot__factory(wallet);
  const ballotContract = ballotFactory.attach(
    contractAddress
  ) as TokenizedBallot;
  const tx = await ballotContract.vote(proposalNumber, amount);
  const receipt = await tx.wait();
  console.log(`Transaction completed ${receipt?.hash}`);

  const WinnerIndex = await ballotContract.winningProposal(); 
  const WinnerName = await ballotContract.winnerName();
  console.log(
    `The current winning proposal is: ${ethers.decodeBytes32String(WinnerName)} - Index: ${WinnerIndex} \n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

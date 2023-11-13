import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { MyToken, MyToken__factory } from "../typechain-types";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("0.1");

async function main() {
    //receiving parameters
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
        throw new Error("Parameters not provided");
    const contractAddress = parameters[0];
    const adressToTransfer = parameters[1];

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
    const VotingPowerTokensContractFactory = new MyToken__factory(wallet);
    const VotingPowerTokensContract = VotingPowerTokensContractFactory.attach(
        contractAddress
    ) as MyToken;

    //experimenting a token transfer - it is not possible to double spent votes
    const transferTx = await VotingPowerTokensContract
        .connect(wallet)
        .transfer(adressToTransfer, MINT_VALUE / 10n)

    await transferTx.wait();

    const votes1AfterTransfer = await VotingPowerTokensContract.getVotes(wallet.address);
    console.log(
        `Account ${wallet.address
        } has ${votes1AfterTransfer.toString()} units of voting power after transferring\n`
    );
    
    const votes2AfterTransfer = await VotingPowerTokensContract.getVotes(adressToTransfer);
    console.log(
        `Account ${adressToTransfer
        } has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`
    );

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

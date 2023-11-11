import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Basic tests for understanding ERC20", async () => {
  async function deployContracts() {
    const accounts = await ethers.getSigners();
    const MyERC20ContractFactory = await ethers.getContractFactory("MyToken");
    const MyERC20Contract = await MyERC20ContractFactory.deploy();
    await MyERC20Contract.waitForDeployment();
    return { accounts, MyERC20Contract };
  }

  it("should have zero total supply at deployment", async () => {
    const { MyERC20Contract } = await loadFixture(deployContracts);
    const totalSupplyBN = await MyERC20Contract.totalSupply();
    const decimals = await MyERC20Contract.decimals();
    const totalSupply = parseFloat(ethers.formatUnits(totalSupplyBN, decimals));
    expect(totalSupply).to.eq(0);
  });

  it("triggers the Transfer event with the address of the sender when sending transactions", async function () {
    const { MyERC20Contract, accounts } = await loadFixture(deployContracts);
    const code = await MyERC20Contract.MINTER_ROLE();
    const roleTx = await MyERC20Contract.grantRole(code, accounts[0].address);
    await roleTx.wait();
    const mintTx = await MyERC20Contract.mint(accounts[0].address, 2);
    await mintTx.wait();
    const senderAddress = accounts[0].address;
    const receiverAddress = accounts[1].address;
    await expect(MyERC20Contract.transfer(receiverAddress, 1))
      .to.emit(MyERC20Contract, "Transfer")
      .withArgs(senderAddress, receiverAddress, 1);
  });
});

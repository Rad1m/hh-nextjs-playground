// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("Token contract", function () {


  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.
  let Token;
  let deBeToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let ownerBalance;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function(){
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("DeBeToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    deBeToken = await Token.deploy();
    await deBeToken.deployed();
  });

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      expect(await deBeToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      ownerBalance = await deBeToken.balanceOf(owner.address);
      expect(await deBeToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Mint and Burn", function (){
    it("Should mint tokens", async function (){
      const mintAmount = 5000;
      console.log("Total supply before mint is: ", (await deBeToken.totalSupply()).toString())
      await deBeToken.mint(addr1.address, mintAmount);
      const addr1Balance = await deBeToken.balanceOf(addr1.address);
      console.log("Balance after mint: ", addr1Balance.toString());
      console.log("Total supply after mint is: ", (await deBeToken.totalSupply()).toString())
      const totSup = await deBeToken.totalSupply();
      expect(addr1Balance).to.equal(mintAmount);
    })

    it("Should BURN! tokens", async function (){
      let burnAmount = 1000;
      const ownerBalanceBeforeBurn = await deBeToken.balanceOf(owner.address);
      console.log("Balance before burn: ", ownerBalanceBeforeBurn.toString());
      await deBeToken.burn(burnAmount);
      const ownerBalanceAftrBurn = await deBeToken.balanceOf(owner.address);
      console.log("Balance after burn: ", ownerBalanceAftrBurn.toString());
      expect(ownerBalanceAftrBurn).to.below(ownerBalanceBeforeBurn);
    })

    it("Should BURN FROM! tokens", async function (){
      const burnAmount = 500;
      const mintAmount = 5000;
      const burnAddress = owner.address;
      await deBeToken.mint(burnAddress, mintAmount);
      const addr1BalanceBeforeBurn = await deBeToken.balanceOf(burnAddress);
      console.log("Balance addr1 before burn: ", addr1BalanceBeforeBurn.toString());
      console.log("Burn amount: ", burnAmount.toString());
      await deBeToken.approve(burnAddress, burnAmount);
      await deBeToken.burnFrom(burnAddress, burnAmount);
      const addr1BalanceAfterBurn = await deBeToken.balanceOf(burnAddress);
      console.log("Balance after burn: ", addr1BalanceAfterBurn.toString());
      expect(addr1BalanceAfterBurn).to.below(addr1BalanceBeforeBurn);
    })

  })

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await deBeToken.transfer(addr1.address, 50);
      const addr1Balance = await deBeToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await deBeToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await deBeToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
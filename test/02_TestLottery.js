const { expect } = require("chai");
const { ethers } = require("hardhat");
const { web3 } = require("@nomiclabs/hardhat-web3");

describe("Betting Contract", function () {
  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.
  let Lottery;
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("DeBeToken");
    token = await Token.deploy();
    await token.deployed();

    Lottery = await ethers.getContractFactory("Lottery");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    lottery = await Lottery.deploy(token.address);
    await lottery.deployed();
  });

  describe("Get user TVL", function () {
    it("Should get user's staked amount", async function () {
      // ARRANGE
      token.transfer(addr2.address, ethers.utils.parseEther("0.5"));
      await token
        .connect(addr2)
        .approve(lottery.address, ethers.utils.parseEther("0.05"));
      // ACT
      await lottery
        .connect(addr2)
        .enterLottery(
          "ARSENAL",
          token.address,
          ethers.utils.parseEther("0.05")
        );
      const userTVL = await lottery.getUserTVL(addr2.address);

      // ASSERT
      console.log("Winner prize is %s", userTVL);
    });
  });

  describe.only("Enter lottery", function () {
    it("Should return staker info", async function () {
      // ARRANGE
      token.transfer(addr2.address, ethers.utils.parseEther("0.5"));
      console.log("Owner is %s", owner.address);
      console.log("Addr2 is %s", addr2.address);

      // ACT
      await token
        .connect(addr2)
        .approve(lottery.address, ethers.utils.parseEther("5000"));

      await lottery
        .connect(addr2)
        .enterLottery(
          "ARSENAL",
          token.address,
          ethers.utils.parseEther("0.05")
        );

      const stakedAmount = await lottery.balances(addr2.address);

      // Assert
      // expect(stakedAmount.stakedAmount).to.equal(0); // there is 5% fee
      console.log("Staked amount is %s", stakedAmount.stakedAmount);
      expect(stakedAmount.betOnThis).to.equal("ARSENAL");
    });
  });

  describe("Calculate prize", function () {
    it("Claim rewards", async function () {
      // arrange
      token.transfer(addr1.address, ethers.utils.parseEther("0.05"));
      token.transfer(addr2.address, ethers.utils.parseEther("0.05"));
      token.transfer(addr3.address, ethers.utils.parseEther("0.05"));

      await token
        .connect(addr1)
        .approve(lottery.address, ethers.utils.parseEther("0.05"));
      await token
        .connect(addr2)
        .approve(lottery.address, ethers.utils.parseEther("0.05"));
      await token
        .connect(addr3)
        .approve(lottery.address, ethers.utils.parseEther("0.05"));

      await lottery
        .connect(addr1)
        .enterLottery(
          "BARCELONA",
          token.address,
          ethers.utils.parseEther("0.01")
        );
      await lottery
        .connect(addr2)
        .enterLottery(
          "ARSENAL",
          token.address,
          ethers.utils.parseEther("0.01")
        );
      await lottery
        .connect(addr3)
        .enterLottery(
          "ARSENAL",
          token.address,
          ethers.utils.parseEther("0.04")
        );

      await lottery.connect(owner).endLottery();
      await lottery.connect(owner).getWinners("ARSENAL");

      const testPlayer = addr3;

      const walletBefore = (
        await token.balanceOf(testPlayer.address)
      ).toString();

      // Act
      await lottery.connect(testPlayer).claimRewards(token.address);
      const walletAfter = (
        await token.balanceOf(testPlayer.address)
      ).toString();

      // Assert
      console.log("Wallet before: ", walletBefore);
      console.log("Wallet after: ", walletAfter);
      expect(walletAfter).to.equal("55600000000000000");

      // Assert 2
      // claim prize second time
      await expect(
        lottery.connect(testPlayer).claimRewards(token.address)
      ).to.be.revertedWith("You have claimed the rewards already");
    });

    it("Should get 0 as there are no winners", async function () {
      //Arrange
      token.transfer(addr1.address, ethers.utils.parseEther("0.05"));
      await token
        .connect(addr1)
        .approve(lottery.address, ethers.utils.parseEther("0.05"));
      await lottery
        .connect(addr1)
        .enterLottery(
          "BARCELONA",
          token.address,
          ethers.utils.parseEther("0.01")
        );
      await lottery.connect(owner).endLottery();
      await lottery.connect(owner).getWinners("ARSENAL");

      // Act
      // Acting is part of assertion in expect error

      // Assert
      // expect transaction to be reverted with error as the player is not a winner
      await expect(
        lottery.connect(addr1).claimRewards(token.address)
      ).to.be.revertedWith("You are not a winner");
    });
  });
});

const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");


  describe("Lottery", function() {
      async function deployLotteryFixture(){
        const [owner, taro, hanako] = await ethers.getSigners()
        const Lottery = await ethers.getContractFactory("Lottery");
        const lottery = await Lottery.deploy()
  
        await lottery.deployed()
        return {lottery, owner, taro, hanako}
      }
      describe("Deployment", function() {
        it("Contract address exists", async () => {
            const {lottery} = await deployLotteryFixture()
            expect(lottery.address).to.be.ok
          })

        it("Should set the right manager", async ()=> {
            const {lottery, owner} = await deployLotteryFixture()
            const managerAddress = await lottery.manager()
            const ownerAddress = await owner.getAddress()
            expect(ownerAddress).to.equal(managerAddress)
        })        
        })

      describe('Enter Lottery', function(){
          it("Enter one account", async() => {
            const {lottery, owner, taro, hanako} = await deployLotteryFixture()
            let taroAddress = await taro.getAddress()
            let enterAmount = '1'
            let wei = ethers.utils.parseEther(enterAmount)
            
            await lottery.connect(taro).enter({value: wei})
            const enteredPlayer = await lottery.players(0)
            expect(enteredPlayer).to.equal(taroAddress)
        })
        
         it("Enter two accounts", async() => {
             const {lottery, taro, hanako} = await deployLotteryFixture()
             let taroAddress = await taro.getAddress()
             let hanakoAddress = await hanako.getAddress()
             let enterAmount= '1'
             let wei = ethers.utils.parseEther(enterAmount)

             await lottery.connect(taro).enter({value: wei})
             await lottery.connect(hanako).enter({value: wei})

             const enteredPlayer1 = await lottery.players(0)
             const enteredPlayer2 = await lottery.players(1)

             expect(enteredPlayer1).to.equal(taroAddress)
             expect(enteredPlayer2).to.equal(hanakoAddress)
         })

         it("require minimum of .01 ether to enter", async () => {
            const {lottery, taro} = await deployLotteryFixture()
            let enterAmount= '0.001'
            let wei = ethers.utils.parseEther(enterAmount)

            await expect(lottery.connect(taro).enter({value: wei})).to.be.revertedWith("Minimum entry fee .01 ether required.")
         })
      })

      describe('Pick Winner', function(){
          it('winner receives ether', async () => {
              const {lottery, owner, taro} = await deployLotteryFixture()
              let enterAmount= '1'
              let wei = ethers.utils.parseEther(enterAmount)

              await lottery.connect(taro).enter({value: wei})

              let initialBalance = await taro.getBalance()

              await lottery.pickWinner()

              let finalBalance = await taro.getBalance()

              let difference = parseFloat(ethers.utils.formatEther(finalBalance)) - parseFloat(ethers.utils.formatEther(initialBalance))
              expect(difference).to.equal(1)
          })

          it('only manager can call the pick winner function', async () => {
            const {lottery, owner, taro} = await deployLotteryFixture()
            let enterAmount= '1'
            let wei = ethers.utils.parseEther(enterAmount)

            await lottery.connect(taro).enter({value: wei})

            await expect(lottery.connect(taro).pickWinner()).to.be.revertedWith("Only manager can call pick winner.")
          })
      })

  })
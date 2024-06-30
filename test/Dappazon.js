const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Dappazon", () => {

    let dappazon
    let deployer, buyer
    let transaction

    let ownerBalanceBefore

    const ID = 1
    const NAME = "Shoes"
    const CATEGORY = "Clothing"
    const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
    const COST  = tokens(1)
    const RATING = 4
    const STOCK = 5

    before(async () => {
      // Deploy
      [deployer, buyer] = await ethers.getSigners()
      console.log("deployer", deployer.address)
      console.log("buyer", buyer.address)

      const Dappazon = await ethers.getContractFactory("Dappazon")
      dappazon = await Dappazon.deploy()

      ownerBalanceBefore = await ethers.provider.getBalance(deployer.address)
    })

    describe("Deployment", () => {
      it("..is deployed:", () => {
        expect(dappazon).not.to.be.empty
      })

      it("..has an owner:", async () => {
        expect(await dappazon.owner()).to.equal(deployer.address)
      })

    })

    describe("Listing", () => {
      
      // beforeEach(async () => {
      //   transaction = await dappazon.connect(deployer).list(
      //     ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK
      //   )
      //   await transaction.wait()
      // })
      before(async () => {
        // Listen to List event
        dappazon.on("List", (from, to, value, event)=>{
          let transferEvent ={
              from: from,
              to: to,
              value: value,
              eventData: event,
          }
          console.log("EVENT:", JSON.stringify(transferEvent, null, 4))
        })

        // List
        transaction = await dappazon.connect(deployer).list(
          ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK
        )
        await transaction.wait()
      })

      it("Returns item attributes", async () => {
        const item = await dappazon.items(ID)
  
        expect(item.id).to.equal(ID)
        expect(item.name).to.equal(NAME)
        expect(item.category).to.equal(CATEGORY)
        expect(item.image).to.equal(IMAGE)
        expect(item.cost).to.equal(COST)
        expect(item.rating).to.equal(RATING)
        expect(item.stock).to.equal(STOCK)
      })

      it("Emits List event", () => {
        console.log("EMIT List check")
        expect(transaction).to.emit(dappazon, "List")  // Does not work!
      })

      // already done
      // it("Listed by owner", async () => {
      //   expect(await dappazon.owner()).to.equal(deployer.address)
      // })
    })    

    describe("Buying", () => {
      let timeBeforeBuy = new Date().getTime()

      before(async () => {
        // buy
        transaction = await dappazon.connect(buyer).buy(ID, { value: COST } )
        await transaction.wait()
      })

      it("Updates the contract balance", async () => {
        let result = await ethers.provider.getBalance(dappazon.address)
        expect(result).to.equal(COST)
      })

      it("Updates buyers order count", async () => {
        let result = await dappazon.orderCount(buyer.address)
        expect(result).to.equal(1)
      })

      it("Updates order time & item", async () => {
        // NOTE the strage way of getting a netsted mapping value
        let order = await dappazon.orders(buyer.address, 1)
        expect(order.time*1000).to.be.greaterThan(timeBeforeBuy)
        console.log("timeBeforeBuy", timeBeforeBuy, "orderTime", order.time) 
        expect(order.item.name).to.be.equal(NAME)
      })

      it("Emits Buy event", async () => {
        console.log("EMIT Buy check")
        expect(transaction).to.emit(dappazon, "Buy") // Does not work!
      })

    })

    describe("Withdrawl", () => {
      
      before(async () => {
        // Withdraw
        transaction = await dappazon.connect(deployer).withdraw()
        await transaction.wait()
      })

      it("Contract balance is zero", async () => {
        let result = await ethers.provider.getBalance(dappazon.address)
        expect(result).to.equal(0)
      })

      it("Owner balance is more", async () => {
        ownerBalanceAfter = await ethers.provider.getBalance(deployer.address)
        console.log("Before", ownerBalanceBefore, "After", ownerBalanceAfter)
        expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore)
      })

    })

})

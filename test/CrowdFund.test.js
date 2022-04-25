const { time, expectRevert, expectEvent, BN } = require("@openzeppelin/test-helpers");
const CrowdFund = artifacts.require("./CrowdFund.sol");

require("dotenv").config({ path: "../.env" });

contract("CrowdFund contract", async function(accounts) {

    const [alice, bob] = accounts; // accounts example: alice is instance deployer, bob is recipient
    const timeToFundingOver = process.env.TIME_TO_FUNDING_PHASE_OVER; // time in seconds to end funding phase
    const fundingGoal = process.env.FUNDING_GOAL;

    beforeEach("should prepare new instance - emit FundCreated() on contract creation", async function() {
        instance = await CrowdFund.new(timeToFundingOver, fundingGoal, bob, { from: alice });
    })

    it("should fund 1000 Wei", async function() {
        const expected = 1000;

        await instance.fund({ from: alice, value: expected })
        const balance = await instance.getBalance(); // returns BN!

        assert.strictEqual(balance.toNumber(), expected);
    });

    it("should emit FundReceived(uint, address, uint) with correct output during funding", async function() {
        const expectedAmount = 2000;
        const expectedUser = alice;

        expectEvent(
            await instance.fund({ from: expectedUser, value: expectedAmount }),
            "FundReceived",
            {
                founder: expectedUser,
                amount: new BN(expectedAmount)
            }
        )
    })


    it("should reject fund() after funding ends", async function() {
        await time.increase(timeToFundingOver);
        await expectRevert(
            instance.fund({ from: alice, value: 1000}),
            "CrowdFund: Funding phase is over already"
        )
    })

    it("should reject 0 eth fund()", async function() {
        await expectRevert(
            instance.fund({ from: bob, value: 0 }),
            "CrowdFund: User has no funds deposited"
        )
    })

    it("should reject execute() call before deadline is up", async function() {
        await expectRevert(
            instance.execute(),
            "CrowdFund: The deadline is not over yet"
        )
    })

    it("should allow to call execute() only once", async function() {
        await time.increase(timeToFundingOver);
        await instance.execute();
        await expectRevert(
            instance.execute(),
            "CrowdFund: Contract has been executed already."
        )
    })

    it("should emit Open() event on execute() call if not enough funds have been sent", async function() {
        await time.increase(timeToFundingOver);
        expectEvent(
            await instance.execute(),
            "Open"
        )
    })

    it("should emit CompleteFundSent(address, amount) on execute() call threshold is reached", async function() {
        const expectedFunds = web3.utils.toWei("1", "ether");

        await instance.fund({ from: alice, value: expectedFunds }); // react threshold
        await time.increase(timeToFundingOver);
        expectEvent(
            await instance.execute(),
            "CompleteFundSent",
            {
                amount: expectedFunds
            }
        )
    })

    it("should reject to withdraw funds when funding phase continues", async function() {
        await expectRevert(
            instance.withdraw(),
            "CrowdFund: Contract is not open for withdraw - funding continues / threshold reached."
        )
    })

    it("should reject to withdraw funds when threshold was reached", async function() {
        await instance.fund({ from: alice, value: web3.utils.toWei("1", "ether") }); // react threshold
        await time.increase(timeToFundingOver);
        await expectRevert(
            instance.withdraw(),
            "CrowdFund: Contract is not open for withdraw - funding continues / threshold reached."
        )
    })

    it("should emit Withdrawal(address, uint) event - if threshold is not reach", async function() {
        const expectedWithdraw = web3.utils.toWei("20", "finney");

        await instance.fund({ from: alice, value: expectedWithdraw });
        await time.increase(timeToFundingOver);
        await instance.execute() // open to withdrawal
        expectEvent(
            await instance.withdraw({ from: alice }),
            "Withdrawal",
            {
                who: alice,
                amount: expectedWithdraw
            }
        )
    })

    it("should reject withdraw() for someone who has not participated in funding", async function() {
        await instance.fund({ from: alice, value: web3.utils.toWei("20", "finney") });
        await time.increase(timeToFundingOver);
        await instance.execute(); // open to withdrawal
        await expectRevert(
            instance.withdraw({ from: bob }), // bob not participated!
            "CrowdFund: No funds to withdraw",
        )
    })

    it("should reject receiving any funds after executing through (1) fund()", async function() {
        await time.increase(timeToFundingOver);
        await instance.execute();
        await expectRevert(
            instance.fund({ from: alice, value: 1000 }),
            "CrowdFund: Funding phase is over already"
        )
    })

    it("should reject receiving any funds after executing through (2) receive() fallback", async function() {
        await time.increase(timeToFundingOver);
        await instance.execute();
        await expectRevert(
            instance.sendTransaction({ from: alice, value: 1000}),
            "CrowdFund: Funding phase is over already"
        )
    })

})
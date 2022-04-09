const { time, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const Staker = artifacts.require("./Staker.sol");

contract("Staker contract", async accounts => {

    const [alice, bob] = accounts; // accounts example, alice is owner
    const timeToStakeOver = 60; // time in seconds to end stake phase

    beforeEach("should setup new, clear instance", async () => {
        instance = await Staker.new();
    })

    it("should stake 1000 Wei", async () => {
        const expected = 1000;

        await instance.stake({ from: alice, value: expected })
        const balance = await instance.getBalance(); // returns BN!

        assert.strictEqual(balance.toNumber(), expected);
    });

    it("should emit Stake(address, uint) with correct output", async () => {
        const expectedAmount = 2000;
        const expectedUser = alice;

        const { logs } = await instance.stake({ from: expectedUser, value: expectedAmount }); // destruct Event
        const { args } = logs[0]; // get Event args
        const { stakingUser, amount } = args;

        assert.strictEqual(amount.toNumber(), expectedAmount);
        expect(stakingUser).to.equal(expectedUser);
    })

    it("should keep track of user balance", async () => {
        const expectedBalance = 5000;

        await instance.stake({ from: bob, value: expectedBalance });
        const balance = await instance.balances(bob);

        assert.strictEqual(balance.toNumber(), expectedBalance);
    })

    it("should reject stake() after staking ends", async () => {
        await time.increase(timeToStakeOver);
        await expectRevert(
            instance.stake({ from: alice, value: 1000}),
            "Staker: Staking phase is over already"
        )
    })

    it("should reject 0 eth stake()", async () => {
        await expectRevert(
            instance.stake({ from: bob, value: 0 }),
            "Staker: User is not staking any ETH"
        )
    })

    it("should reject execute() call before deadline is up", async () => {
        await expectRevert(
            instance.execute(),
            "Staker: The deadline is not over yet"
        )
    })

    it("should allow to call execute() only once", async () => {
        await time.increase(timeToStakeOver);
        await instance.execute();
        await expectRevert(
            instance.execute(),
            "Staker: Contract has been executed already"
        )
    })

    it("should emit Open() event on execute() call if not enough funds have been sent", async () => {
        await time.increase(timeToStakeOver);
        await expectEvent(
            await instance.execute(),
            "Open"
        )
    })

    it("should emit StakeSent(address, amount) on execute() call threshold is reached", async () => {
        const expectedStake = web3.utils.toWei("1", "ether");

        await instance.stake({ from: alice, value: expectedStake }); // react threshold
        await time.increase(timeToStakeOver);
        await expectEvent(
            await instance.execute(),
            "StakeSent",
            {
                amount: expectedStake
            }
        )
    })

    it("should reject to withdraw funds when staking continues", async () => {
        await expectRevert(
            instance.withdraw(),
            "Staker: Contract is not open for withdraw - staking continues / threshold reached"
        )
    })

    it("should reject to withdraw funds when threshold was reached", async () => {
        await instance.stake({ from: alice, value: web3.utils.toWei("1", "ether") }); // react threshold
        await time.increase(timeToStakeOver);
        await expectRevert(
            instance.withdraw(),
            "Staker: Contract is not open for withdraw - staking continues / threshold reached"
        )
    })

    it("should emit Withdrawal(address, uint) event - if threshold is not reach", async () => {
        const expectedWithdraw = web3.utils.toWei("20", "finney");

        await instance.stake({ from: alice, value: expectedWithdraw });
        await time.increase(timeToStakeOver);
        await instance.execute() // open to withdrawal
        await expectEvent(
            await instance.withdraw({ from: alice }),
            "Withdrawal",
            {
                who: alice,
                amount: expectedWithdraw
            }
        )
    })

    it("should decrease balance after withdraw() - if threshold is not reach", async () => {
        await instance.stake({ from: alice, value: web3.utils.toWei("20", "finney") });
        await time.increase(timeToStakeOver);
        await instance.execute(); // open to withdrawal
        await instance.withdraw({ from: alice });
        
        const newAliceBalance = await instance.balances(alice);
        assert.strictEqual(newAliceBalance.toNumber(), 0);
    })

    it("should reject withdraw() for someone who has not participated in staking", async () => {
        await instance.stake({ from: alice, value: web3.utils.toWei("20", "finney") });
        await time.increase(timeToStakeOver);
        await instance.execute(); // open to withdrawal
        await expectRevert(
            instance.withdraw({ from: bob }), // bob not participated!
            "Staker: No funds to withdraw",
        )
    })

    it("should reject receiving any funds after executing through (1) stake()", async () => {
        await time.increase(timeToStakeOver);
        await instance.execute();
        await expectRevert(
            instance.stake({ from: alice, value: 1000 }),
            "Staker: Stake no longer accepts any funds"
        )
    })

    it("should reject receiving any funds after executing through (2) receive() fallback", async () => {
        await time.increase(timeToStakeOver);
        await instance.execute();
        await expectRevert(
            instance.sendTransaction({ from: alice, value: 1000}),
            "Staker: Stake no longer accepts any funds"
        )
    })
})
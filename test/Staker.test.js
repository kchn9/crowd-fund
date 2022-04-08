const Staker = artifacts.require("./Staker.sol");

contract("Staker contract", async accounts => {

    const [alice, bob] = accounts;

    beforeEach("should setup new, clear instance", async () => {
        instance = await Staker.new();
    })

    it("should stake 1000 Wei", async () => {
        const expected = 1000;

        const _ = await instance.stake({ from: alice, value: expected })
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

        const _ = await instance.stake({ from: bob, value: expectedBalance });
        const balance = await instance.balances(bob);

        assert.strictEqual(balance.toNumber(), expectedBalance);
    })
})
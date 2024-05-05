import { Cell, address, toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { MainContract } from "../wrappers/MainContract";
import "@ton/test-utils";
import { compile } from "@ton/blueprint";

describe("main.fc contract tests", () => {

    let blockchain: Blockchain;
    let myContract: SandboxContract<MainContract>;
    let initWallet: SandboxContract<TreasuryContract>;
    let ownerWallet: SandboxContract<TreasuryContract>;
    let codeCell: Cell;

    beforeAll(async() => {
        codeCell = await compile("MainContract");
    });

    beforeEach(async() => {
        blockchain = await Blockchain.create();
        initWallet = await blockchain.treasury("MnemonicForInitWallet");
        ownerWallet = await blockchain.treasury("MnemonicForOwnerWallet");
        
        myContract = blockchain.openContract(
            MainContract.createFromConfig(
                {
                    number: 0,
                    address: initWallet.address,
                    owner_address: ownerWallet.address,
                },
                codeCell
            )
        );
    } )

    it("should get proper send address", async() => {
        
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

        const sentMessageResult = await myContract.sendIncrement(
            senderWallet.getSender(), 
            toNano("0.05"), 
            5
        );

        expect(sentMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
        });

        const data = await myContract.getData();

        expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
        expect(data.number).toEqual(5);

    });

    it("successfully deposits funds", async () => {
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

        const depositMessageResult = await myContract.sendDeposit(
            senderWallet.getSender(), 
            toNano("1"),
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
        });

        const balanceRequest = await myContract.getBalance();

        expect(balanceRequest.balance).toBeGreaterThan(toNano("0.99"));
    });

    it("should return deposit funds as no command is sent", async () => {
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

        const depositMessageResult = await myContract.sendNoCodeDeposit(
            senderWallet.getSender(), 
            toNano("1"),
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: false,
        });

        const balanceRequest = await myContract.getBalance();

        expect(balanceRequest.balance).toEqual(0);
    });

    it("successfully withdraws funds on behalf of owner", async () => {
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

        await myContract.sendDeposit(senderWallet.getSender(), toNano("1"))

        const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
            ownerWallet.getSender(), 
            toNano("0.05"),
            toNano("0.5")
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: myContract.address,
            to: ownerWallet.address,
            success: true,
            value: toNano("0.5")
        });
    });

    it("fails to withdraw funds on behalf of non-owner", async () => {
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

        await myContract.sendDeposit(senderWallet.getSender(), toNano("1"))

        const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
            senderWallet.getSender(), 
            toNano("0.05"),
            toNano("0.5")
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: false,
            exitCode: 103
        });
    });

    it("fails to withdraw funds because lack of balance", async () => {
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

        const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
            ownerWallet.getSender(), 
            toNano("0.05"),
            toNano("0.5")
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: ownerWallet.address,
            to: myContract.address,
            success: false,
            exitCode: 104
        });
    });

	it("consequencess calls correct", async() => {
        const senderWallet = await blockchain.treasury("MnemonicForSenderWallet")

		const sentMessageResultFirstCall = await myContract.sendIncrement(senderWallet.getSender(),toNano("0.05"),1);

		expect(sentMessageResultFirstCall.transactions).toHaveTransaction({
			from: senderWallet.address,
			to: myContract.address,
			success: true,
		});

		const getDataFirstCall = await myContract.getData();
		expect(getDataFirstCall.number).toEqual(1); 

		const sentMessageResultSecondCall = await myContract.sendIncrement(senderWallet.getSender(),toNano("0.05"),2);
		expect(sentMessageResultSecondCall.transactions).toHaveTransaction({
			from: senderWallet.address,
			to: myContract.address,
			success: true,
		});

		const getDataSecondCall = await myContract.getData();

		expect(getDataSecondCall.recent_sender.toString()).toBe(senderWallet.address.toString());
		expect(getDataSecondCall.number).toEqual(3);
	});

});

import { address, toNano } from "@ton/core";
import { MainContract } from "../wrappers/MainContract";
import { compile, NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    
    const codeCell = await compile("MainContract");

    const myContract = MainContract.createFromConfig(
        {
            number: 0,
            address: address("0QADMTZjwvsFKapV0u4bQuBISsL4e87Es6B3GnIFJnYpsdDG"),
            owner_address: address(
                "0QADMTZjwvsFKapV0u4bQuBISsL4e87Es6B3GnIFJnYpsdDG"
            ),
        },
        codeCell
    );

    const openedContract = provider.open(myContract);

    openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);
}

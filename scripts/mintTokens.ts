import { NetworkProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));
    const toAddress = Address.parse(args.length > 0 ? args[0] : await ui.input('Wallet address'));

    const jettonMinter = provider.open(JettonMinter.createFromAddress(address));

        await jettonMinter.sendMint(provider.sender(), {
            value: toNano('0.2'),
            amount: toNano('0.05'),
            jettonAmount: toNano('100'),
            toAddress,
            queryId: Date.now()
        });

    ui.write('Minted successfully!');
}

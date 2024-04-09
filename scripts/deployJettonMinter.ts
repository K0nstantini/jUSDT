import { Address, Cell, beginCell, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { NetworkProvider, compile } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {


	const jettonMinter = provider.open(JettonMinter.createFromConfig({

		// content: buildOnchainMetadata(metadata),
		// content: beginCell().storeUint(randomSeed, 256).endCell(),
		adminAddress: provider.sender().address as Address,
		content: minterContent(),
		jettonWalletCode: await compile('JettonWallet')

	}, await compile('JettonMinter')));

	await jettonMinter.sendDeploy(provider.sender(), toNano('0.05'));

	await provider.waitForDeploy(jettonMinter.address);

	// run methods on `jettonMinter`
}

export function minterContent() {
	return jusdtContent();
};

function jusdtContent()  {
	const randomSeed = Math.floor(Math.random() * 10000);
	return beginCell()
		.storeRef(beginCell()
			.storeStringTail('https://raw.githubusercontent.com/K0nstantini/jUSDT/main/jUSDT-data.json')
			.endCell()
		)
		.storeRef(beginCell()
			.storeStringTail('https://bridge.ton.org/token/1/0xdac17f958d2ee523a2206206994597c13d831ec7.png')
			.endCell()
		)
		.storeUint(6, 8)
		.storeUint(randomSeed, 256)
		.endCell();
};


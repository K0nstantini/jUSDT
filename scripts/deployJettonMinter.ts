import { Cell, beginCell, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { NetworkProvider, compile } from '@ton/blueprint';
import { buildOnchainMetadata } from './minterContent';
import metadata from "./data.json";

export async function run(provider: NetworkProvider) {

	const randomSeed = Math.floor(Math.random() * 10000);

	const jettonMinter = provider.open(JettonMinter.createFromConfig({

		// content: buildOnchainMetadata(metadata),
		content: beginCell().storeUint(randomSeed, 256).endCell(),
		// content: minterContent(),
		jettonWalletCode: await compile('JettonWallet')

	}, await compile('JettonMinter')));

	await jettonMinter.sendDeploy(provider.sender(), toNano('0.05'));

	await provider.waitForDeploy(jettonMinter.address);

	// run methods on `jettonMinter`
}

// export function minterContent() {
// 	return beginCell()
// 		.storeUint(0, 32)
// 		.storeUint(0, 160)
// 		.storeUint(0, 8)
// 		.endCell();
// };


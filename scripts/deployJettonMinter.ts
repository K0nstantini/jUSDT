import { Cell, beginCell, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { NetworkProvider, compile } from '@ton/blueprint';
import { buildOnchainMetadata } from './minterContent';

export async function run(provider: NetworkProvider) {

	// const randomSeed = Math.floor(Math.random() * 10000);

	const jettonMinter = provider.open(JettonMinter.createFromConfig({

		// content: buildOnchainMetadata(metadata),
		// content: beginCell().storeUint(randomSeed, 256).endCell(),
		content: minterContent(),
		jettonWalletCode: await compile('JettonWallet')

	}, await compile('JettonMinter')));

	await jettonMinter.sendDeploy(provider.sender(), toNano('0.05'));

	await provider.waitForDeploy(jettonMinter.address);

	// run methods on `jettonMinter`
}

export function minterContent() {
	return beginCell()
		.storeUint(1, 32)
		.storeUint(BigInt('0xdac17f958d2ee523a2206206994597c13d831ec7'), 160)
		.storeUint(6, 8)
		.endCell();
};


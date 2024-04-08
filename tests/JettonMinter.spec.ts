import { compile } from "@ton/blueprint";
import { JettonMinter } from "../wrappers/JettonMinter";
import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { address, toNano, Cell, beginCell, Dictionary } from '@ton/core';
import '@ton/test-utils';

describe('JettonMinter', () => {
	let code: Cell;

	beforeAll(async () => {
		code = await compile('JettonMinter');
	});

	let blockchain: Blockchain;
	let jettonMinter: SandboxContract<JettonMinter>;
	let random: SandboxContract<TreasuryContract>;

	beforeEach(async () => {
		blockchain = await Blockchain.create();
		random = await blockchain.treasury('random');

		const randomSeed = Math.floor(Math.random() * 10000);
		jettonMinter = blockchain.openContract(JettonMinter.createFromConfig({
			// content: minterContent(),
			content: beginCell().storeUint(randomSeed, 256).endCell(),
			jettonWalletCode: await compile('JettonWallet')

		}, code));

		const deployer = await blockchain.treasury('deployer');

		const deployResult = await jettonMinter.sendDeploy(deployer.getSender(), toNano('0.05'));

		expect(deployResult.transactions).toHaveTransaction({
			from: deployer.address,
			to: jettonMinter.address,
			deploy: true,
			success: true,
		});
	});

	it('should deploy', async () => {
		// the check is done inside beforeEach
		// blockchain and jettonMinter are ready to use
	});

	it('check data', async () => {
		let data = await jettonMinter.getJettonData();
		let dict = data.beginParse()
			.skip(8)
			.loadDict(Dictionary.Keys.BigInt(256), Dictionary.Values.Cell());
		let uriCell = dict.get(BigInt('0x70e5d7b6a29b392f85076fe15ca2f2053c56c2338728c4e33c9e8ddb1ee827cc'));
		expect(uriCell).not.toBeNull();
		if (uriCell == null) return;
		let uriHex = uriCell?.beginParse().skip(8).toString();
		let uri = hex_to_ascii(uriHex);
		console.log(uri);

		let imageCell = dict.get(BigInt('0x6105d6cc76af400325e94d588ce511be5bfdbb73b437dc51eca43917d7a43e3d'));
		expect(imageCell).not.toBeNull();
		if (imageCell == null) return;
		let imageHex = imageCell?.beginParse().skip(8).toString();
		let image = hex_to_ascii(imageHex);
		console.log(image);
	});
});


export function hex_to_ascii(hex: string) {
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, n + 2), 16));
	}
	return str;
}

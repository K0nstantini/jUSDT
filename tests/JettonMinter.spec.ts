import { compile } from "@ton/blueprint";
import { JettonMinter } from "../wrappers/JettonMinter";
import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { address, toNano, Cell, beginCell, Dictionary } from '@ton/core';
import '@ton/test-utils';
import { writeFileSync } from "fs";
import { minterContent } from "../scripts/deployJettonMinter";

describe('JettonMinter', () => {
	let code: Cell;

	beforeAll(async () => {
		code = await compile('JettonMinter');
	});

	let blockchain: Blockchain;
	let jettonMinter: SandboxContract<JettonMinter>;
	let deployer: SandboxContract<TreasuryContract>;
	let random: SandboxContract<TreasuryContract>;

	beforeEach(async () => {
		blockchain = await Blockchain.create();
		random = await blockchain.treasury('random');
		deployer = await blockchain.treasury('deployer');

		jettonMinter = blockchain.openContract(JettonMinter.createFromConfig({
			adminAddress: deployer.address,
			content: minterContent(),
			jettonWalletCode: await compile('JettonWallet')

		}, code));

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

		let uriKey = BigInt('0x70e5d7b6a29b392f85076fe15ca2f2053c56c2338728c4e33c9e8ddb1ee827cc');
		let uriCell = dict.get(uriKey);
		expect(uriCell).not.toBeNull();
		expect(uriCell).not.toBeUndefined();
		if (uriCell == null) return;
		let uri = get_str_from_cell(uriCell);
		console.log(uri);

		let imageCell = dict.get(BigInt('0x6105d6cc76af400325e94d588ce511be5bfdbb73b437dc51eca43917d7a43e3d'));
		expect(imageCell).not.toBeNull();
		expect(imageCell).not.toBeUndefined();
		if (imageCell == null) return;
		let image = get_str_from_cell(imageCell);
		console.log(image);

		// let newUriCell = beginCell()
		// 	.storeUint(0, 8)
		// 	.storeStringTail('https://raw.githubusercontent.com/K0nstantini/jUSDT/main/data.json')
		// 	.endCell();
		//
		// let newUri = get_str_from_cell(newUriCell);
		// console.log(newUri);
		//
		// dict.set(uriKey, newUriCell);
		// let newData = beginCell()
		// 	.storeUint(0, 8)
		// 	.storeDict(dict)
		// 	.endCell();
		// let boc: Buffer = newData.toBoc();
		// console.log(boc.toString('hex'));

	});

	it('should mint', async () => {
		let res = await jettonMinter.sendMint(deployer.getSender(), {
			toAddress: random.address,
			jettonAmount: 1000n,
			amount: toNano('0.05'),
			value: toNano('0.2'),
			queryId: Date.now()
		});

		expect(res.transactions).toHaveTransaction({
			from: deployer.address,
			to: jettonMinter.address,
			success: true,
		});

		let supply = await jettonMinter.getTotalsupply();
		expect(supply).toEqual(1000n);

	});
});

function get_str_from_cell(cell: Cell) {
	let uriHex = cell.beginParse().skip(8).toString();
	return hex_to_ascii(uriHex);
}


export function hex_to_ascii(hex: string) {
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, n + 2), 16));
	}
	return str;
}

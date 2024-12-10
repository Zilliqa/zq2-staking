import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { readContract } from 'viem/actions';
import { delegatorAbi } from '@/misc/stakingAbis';
import { Address, erc20Abi } from 'viem';
import { getViemClient } from '@/misc/chainConfig';
import { StakingPoolDefinition } from '@/misc/stakingPoolsConfig';

interface Args {
  network_id: string;
  contract_address: string;
  icon_url: string;
  name: string;
}

const argv = yargs(hideBin(process.argv))
  .option('network_id', {
    type: 'string',
    description: 'The network id of the network to connect to. It must be defined in chainConfig.ts',
    demandOption: true,
  })
  .option('contract_address', {
    type: 'string',
    description: 'The contract address in hex format',
    demandOption: true,
  })
  .option("icon_url", {
    type: "string",
    description: "The icon url of the pool",
    demandOption: true,
  })
  .option('name', {
    type: 'string',
    description: 'The name of the pool',
    demandOption: true,
   })
  .help()
  .alias('help', 'h')
  .argv as Args;

(
  async () => {
    console.log(`Network RPC URL: ${argv.network_id}`);
    console.log(`Contract Address: ${argv.contract_address}`);

    const chainid = parseInt(argv.network_id);

    const tokenAddress = await readContract(getViemClient(chainid), {
      address: argv.contract_address as Address,
      abi: delegatorAbi,
      functionName: "getLST",
    }) as string;

    const [
      tokenDecimals,
      tokenSymbol,
      minimumStake,
    ] = await Promise.all([
      readContract(getViemClient(chainid), {
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      readContract(getViemClient(chainid), {
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      readContract(getViemClient(chainid), {
        address: argv.contract_address as Address,
        abi: delegatorAbi,
        functionName: "MIN_DELEGATION",
      }),
    ]);

    const hash = Buffer.from(argv.contract_address + tokenAddress).toString('base64').slice(0, 8);

    const definition: StakingPoolDefinition = {
      id: hash,
        address: argv.contract_address,
        tokenAddress,
        iconUrl: argv.icon_url,
        name: argv.name,
        tokenDecimals,
        tokenSymbol,
        minimumStake: minimumStake as bigint,
    }

    console.log("Add following definition to stakingPoolsConfig.ts");
    // console.log(JSON.stringify({ definition }, null, 2));
    console.log({ definition,  });
  }
)();


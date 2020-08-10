import ERC20 from "darknode-sol/build/erc/ERC20.json";
import BasicAdapter from "darknode-sol/build/testnet/BasicAdapter.json";
// import BCHGateway from "darknode-sol/build/testnet/BCHGateway.json";
// import BTCGateway from "darknode-sol/build/testnet/BTCGateway.json";
import DarknodePayment from "darknode-sol/build/testnet/DarknodePayment.json";
import DarknodePaymentStore from "darknode-sol/build/testnet/DarknodePaymentStore.json";
import DarknodeRegistryLogic from "darknode-sol/build/testnet/DarknodeRegistryLogicV1.json";
import DarknodeRegistryProxy from "darknode-sol/build/testnet/DarknodeRegistryProxy.json";
import DarknodeRegistryStore from "darknode-sol/build/testnet/DarknodeRegistryStore.json";
import DarknodeSlasher from "darknode-sol/build/testnet/DarknodeSlasher.json";
import GatewayLogic from "darknode-sol/build/testnet/GatewayLogicV1.json";
import GatewayRegistry from "darknode-sol/build/testnet/GatewayRegistry.json";
import ProtocolLogic from "darknode-sol/build/testnet/ProtocolLogicV1.json";
import ProtocolProxy from "darknode-sol/build/testnet/ProtocolProxy.json";
import RenBCH from "darknode-sol/build/testnet/RenBCH.json";
import RenBTC from "darknode-sol/build/testnet/RenBTC.json";
import RenToken from "darknode-sol/build/testnet/RenToken.json";
import RenZEC from "darknode-sol/build/testnet/RenZEC.json";
// import ZECGateway from "darknode-sol/build/testnet/ZECGateway.json";
import { AbiItem } from "web3-utils";

interface Contract {
    address?: string;
    abi?: AbiItem[];
    block?: number;
    decimals?: number;
}

interface Addresses<C extends Contract> {
    [category: string]: {
        [contract: string]: C;
    };
}

const networkID = 97;

interface NetworkType<C extends Contract, A extends Addresses<C>> {
    version: "1.0.0";
    name:
        | "mainnet"
        | "chaosnet"
        | "testnet"
        | "devnet"
        | "localnet"
        | "celoTestnet";
    chain: "main" | "kovan" | "celoTestnet";
    isTestnet: boolean;
    label: string;
    networkID: number;
    chainLabel: string;
    infura: string;
    etherscan: string;
    lightnode: string;
    addresses: A;
}

export const CastNetwork = <
    C extends Contract,
    A extends Addresses<C>,
    N extends NetworkType<C, A>
>(
    t: N,
) => t;

export const renCeloTestnet = CastNetwork({
    version: "1.0.0",
    name: "celoTestnet",
    chain: "celoTestnet",
    isTestnet: true,
    label: "Celo Alfajores",
    chainLabel: "Celo Alfajores",
    networkID,
    infura: "https://alfajores-forno.celo-testnet.org",
    etherscan: "",
    lightnode: "https://lightnode-testnet.herokuapp.com",
    addresses: {
        // ren: {
        //     Protocol: {
        //         address: ProtocolProxy.networks[3].address,
        //         abi: ProtocolLogic.abi as AbiItem[],
        //         artifact: ProtocolProxy,
        //     },
        //     DarknodeSlasher: {
        //         address: DarknodeSlasher.networks[3].address,
        //         abi: DarknodeSlasher.abi as AbiItem[],
        //         artifact: DarknodeSlasher,
        //     },
        //     DarknodeRegistry: {
        //         address: DarknodeRegistryProxy.networks[3].address,
        //         abi: DarknodeRegistryLogic.abi as AbiItem[],
        //         artifact: DarknodeRegistryLogic,
        //         block: 17625998,
        //     },
        //     DarknodeRegistryStore: {
        //         address: DarknodeRegistryStore.networks[3].address,
        //         abi: DarknodeRegistryStore.abi as AbiItem[],
        //         artifact: DarknodeRegistryStore,
        //     },
        //     DarknodePayment: {
        //         address: DarknodePayment.networks[3].address,
        //         abi: DarknodePayment.abi as AbiItem[],
        //         artifact: DarknodePayment,
        //     },
        //     DarknodePaymentStore: {
        //         address: DarknodePaymentStore.networks[3].address,
        //         abi: DarknodePaymentStore.abi as AbiItem[],
        //         artifact: DarknodePaymentStore,
        //     },
        // },

        gateways: {
            GatewayRegistry: {
                address: "0xD881213F5ABF783d93220e6bD3Cc21706A8dc1fC",
                abi: GatewayRegistry.abi as AbiItem[],
                artifact: GatewayRegistry,
            },
            RenBTC: {
                _address: "0x07F10424272579865249809BE7EB211f314d8B79",
                abi: RenBTC.abi as AbiItem[],
                artifact: RenBTC,
                description: `gatewayRegistry.getTokenBySymbol("BTC")`,
            },
            BTCGateway: {
                _address: "0x3645115A577Ea62b0E305Be4329Eb7816Ae056eA",
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic,
                description: `gatewayRegistry.getGatewayBySymbol("BTC")`,
            },
            RenZEC: {
                _address: "0xEF685D1D44EA983927D9F8D67F77894fAEC92FCF",
                abi: RenZEC.abi as AbiItem[],
                artifact: RenZEC,
                description: `gatewayRegistry.getTokenBySymbol("ZEC")`,
            },
            ZECGateway: {
                _address: "0xF9fAE250B8dda539B9AFfEb606C8e2631976413E",
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic,
                description: `gatewayRegistry.getGatewayBySymbol("ZEC")`,
            },
            RenBCH: {
                _address: "0x49fa7a3B9705Fa8DEb135B7bA64C2Ab00Ab915a1",
                abi: RenBCH.abi as AbiItem[],
                artifact: RenBCH,
                description: `gatewayRegistry.getTokenBySymbol("BCH")`,
            },
            BCHGateway: {
                _address: "0xc735241F93F87D4DBEA499EE6e1d41Ec50e3D8cE",
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic,
                description: `gatewayRegistry.getGatewayBySymbol("BCH")`,
            },
            BasicAdapter: {
                address: "0xD087b0540e172553c12DEEeCDEf3dFD21Ec02066",
                abi: BasicAdapter.abi as AbiItem[],
                artifact: BasicAdapter,
            },
        },
        // tokens: {
        //     DAI: {
        //         address: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
        //         decimals: 18,
        //     },
        //     BTC: {
        //         address: RenBTC.networks[3].address,
        //         abi: RenBTC.abi as AbiItem[],
        //         artifact: RenBTC,
        //         decimals: 8,
        //     },
        //     ZEC: {
        //         address: RenZEC.networks[3].address,
        //         abi: RenZEC.abi as AbiItem[],
        //         artifact: RenZEC,
        //         decimals: 8,
        //     },
        //     BCH: {
        //         address: RenBCH.networks[3].address,
        //         abi: RenBCH.abi as AbiItem[],
        //         artifact: RenBCH,
        //         decimals: 8,
        //     },
        //     REN: {
        //         address: RenToken.networks[3].address,
        //         abi: RenToken.abi as AbiItem[],
        //         artifact: RenToken,
        //         decimals: 18,
        //     },
        //     ETH: {
        //         address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        //         decimals: 18,
        //     },
        // },
        erc: {
            ERC20: {
                abi: ERC20.abi as AbiItem[],
                artifact: ERC20,
            },
        },
    },
});

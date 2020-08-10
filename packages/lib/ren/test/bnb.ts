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
        | "bnbTestnet";
    chain: "main" | "kovan" | "bnbTestnet";
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

export const renBinanceTestnet = CastNetwork({
    version: "1.0.0",
    name: "bnbTestnet",
    chain: "bnbTestnet",
    isTestnet: true,
    label: "Binance Testnet",
    chainLabel: "Binance Testnet",
    networkID,
    infura: "https://data-seed-prebsc-1-s1.binance.org:8545",
    etherscan: "https://explorer.binance.org/smart-testnet",
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
                address: "0xf1DA6f4A594553335EdeA6B1203a4B590c752E32",
                abi: GatewayRegistry.abi as AbiItem[],
                artifact: GatewayRegistry,
            },
            RenBTC: {
                _address: "0x23e66DEcBd099AEf2521e97035F76Bf0c44B8249",
                abi: RenBTC.abi as AbiItem[],
                artifact: RenBTC,
                description: `gatewayRegistry.getTokenBySymbol("BTC")`,
            },
            BTCGateway: {
                _address: "0xEF685D1D44EA983927D9F8D67F77894fAEC92FCF",
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic,
                description: `gatewayRegistry.getGatewayBySymbol("BTC")`,
            },
            RenZEC: {
                _address: "0x15f692D6B9Ba8CEC643C7d16909e8acdEc431bF6",
                abi: RenZEC.abi as AbiItem[],
                artifact: RenZEC,
                description: `gatewayRegistry.getTokenBySymbol("ZEC")`,
            },
            ZECGateway: {
                _address: "0x49fa7a3B9705Fa8DEb135B7bA64C2Ab00Ab915a1",
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic,
                description: `gatewayRegistry.getGatewayBySymbol("ZEC")`,
            },
            RenBCH: {
                _address: "0xe1Ae770a368ef05158c65c572701778575Da85d0",
                abi: RenBCH.abi as AbiItem[],
                artifact: RenBCH,
                description: `gatewayRegistry.getTokenBySymbol("BCH")`,
            },
            BCHGateway: {
                _address: "0x32924e6EE523d99C683BA4b100580591Cd2a5fC9",
                abi: GatewayLogic.abi as AbiItem[],
                artifact: GatewayLogic,
                description: `gatewayRegistry.getGatewayBySymbol("BCH")`,
            },
            BasicAdapter: {
                address: "0xD881213F5ABF783d93220e6bD3Cc21706A8dc1fC",
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

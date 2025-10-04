declare module '@vechain/vechain-kit' {
    import { ReactNode } from 'react';

    export interface VeChainKitProviderProps {
        children: ReactNode;
        feeDelegation?: any;
        dappKit?: any;
        loginMethods?: any[];
        loginModalUI?: any;
        darkMode?: boolean;
        language?: string;
        network?: {
            type: string;
        };
        allowCustomTokens?: boolean;
        legalDocuments?: any;
    }

    export const useWallet: any;
    export const useGetB3trBalance: any;
    export const useCurrentAllocationsRoundId: any;
    export const useIsPerson: any;
    export const useSignMessage: any;
    export const useSignTypedData: any;
    export const WalletButton: any;
    export const VeChainKitProvider: React.ComponentType<VeChainKitProviderProps>;
}

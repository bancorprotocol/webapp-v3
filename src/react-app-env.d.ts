/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_ALCHEMY_MAINNET: string;
    REACT_APP_ALCHEMY_ROPSTEN: string;
    REACT_APP_FORTMATIC_API_KEY: string;
    REACT_APP_PORTIS_DAPP_ID: string;
    REACT_APP_APY_VISION_TOKEN: string;
    REACT_APP_INTOTHEBLOCK_KEY: string;
    REACT_APP_BANCOR_V3_CONTRACT_NETWORK_SETTINGS: string;
    REACT_APP_BANCOR_V3_CONTRACT_STANDARD_STAKING_REWARDS: string;
    REACT_APP_BANCOR_V3_CONTRACT_BANCOR_NETWORK: string;
    REACT_APP_BANCOR_V3_CONTRACT_BANCOR_NETWORK_INFO: string;
    REACT_APP_BANCOR_V3_TEST_RPC_URL?: string;
  }
}

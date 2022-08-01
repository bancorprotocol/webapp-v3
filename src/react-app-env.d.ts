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
    REACT_APP_SENTRY_DSN: string;
  }
}

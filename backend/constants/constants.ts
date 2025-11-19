import { Commitment } from "@solana/web3.js";
import { logger, retrieveEnvVariable } from "../utils";

export const NETWORK = 'mainnet-beta';
export const COMMITMENT_LEVEL: Commitment = retrieveEnvVariable('COMMITMENT_LEVEL', logger) as Commitment;
export const RPC_ENDPOINT = retrieveEnvVariable('RPC_ENDPOINT', logger);
export const API_KEY = retrieveEnvVariable('API_KEY', logger);
export const GRPC_ENDPOINT = retrieveEnvVariable('GRPC_ENDPOINT', logger);
export const LOG_LEVEL = retrieveEnvVariable('LOG_LEVEL', logger);
export const PRIVATE_KEY = retrieveEnvVariable('PRIVATE_KEY', logger);
export const QUOTE_MINT = retrieveEnvVariable('QUOTE_MINT', logger);
export const QUOTE_AMOUNT = Number(retrieveEnvVariable('QUOTE_AMOUNT', logger));

export const TAKE_PROFIT = Number(retrieveEnvVariable('TAKE_PROFIT', logger));
export const BUY_SLIPPAGE = Number(retrieveEnvVariable('BUY_SLIPPAGE', logger));
export const STOP_LOSS = Number(retrieveEnvVariable('STOP_LOSS', logger));
export const SELL_SLIPPAGE = Number(retrieveEnvVariable('SELL_SLIPPAGE', logger));
export const MAX_BUY = Number(retrieveEnvVariable('MAX_BUY', logger));
export const MAX_HOLDING_TIME = Number(retrieveEnvVariable('MAX_HOLDING_TIME', logger));

export const COMPOUNDING_BUY_AMOUNT_PERCENTAGE = Number(retrieveEnvVariable('COMPOUNDING_BUY_AMOUNT_PERCENTAGE', logger));
export const COMPOUNDING_GAS_FEE_PERCENTAGE = Number(retrieveEnvVariable('COMPOUNDING_GAS_FEE_PERCENTAGE', logger));
export const BALANCE_BASED_STOP_AMOUNT = Number(retrieveEnvVariable('BALANCE_BASED_STOP_AMOUNT', logger));
export const BALANCE_BASED_RESUME_AMOUNT = Number(retrieveEnvVariable('BALANCE_BASED_RESUME_AMOUNT', logger));
export const PROFIT_BASED_STOP_AMOUNT = Number(retrieveEnvVariable('PROFIT_BASED_STOP_AMOUNT', logger));
export const TIME_BASED_SELL_SIZE = Number(retrieveEnvVariable('TIME_BASED_SELL_SIZE', logger));

export const TELEGRAM_BOT_TOKEN = retrieveEnvVariable('TELEGRAM_BOT_TOKEN', logger);
export const TELEGRAM_CHAT_ID = retrieveEnvVariable(`TELEGRAM_CHAT_ID`, logger);

export const COPY_WALLET = retrieveEnvVariable(`COPY_WALLET`, logger);
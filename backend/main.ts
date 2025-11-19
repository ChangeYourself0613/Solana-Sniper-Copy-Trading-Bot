import { pump_copy } from './streaming/pump_copy';
import { GRPC_ENDPOINT ,API_KEY} from './constants';
require('dotenv').config();

import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import Client from '@triton-one/yellowstone-grpc';

const client = new Client(GRPC_ENDPOINT, API_KEY, undefined);
/*
If you use use grpc by whitelisting ip address, use following

const client = new Client(GRPC_ENDPOINT, undefined, undefined);
*/
const app=express();
const corsOptions = {
  origin: true,
  credentials: true,
}
app.use(express.json())
app.use(express.urlencoded())
app.use(cors(corsOptions))
async function start() {
  pump_copy(client);
}
start();

app.post("/api/v1/set",(req,res)=>{
  const {COMPOUNDING, SEQUENCING,PROFIT_BASED_STOP ,TIME_BASED_SELL}=req.body;
  logger.info(`Resetting environment variables`)
  logger.info(`COMPOUNDING->${COMPOUNDING}`)
  logger.info(`SEQUENCING->${SEQUENCING}`)
  logger.info(`PROFIT_BASED_STOP->${PROFIT_BASED_STOP}`)
  logger.info(`TIME_BASED_SELL->${TIME_BASED_SELL}`)
  process.env.COMPOUNDING=COMPOUNDING;
  process.env.SEQUENCING=SEQUENCING;
  process.env.PROFIT_BASED_STOP=PROFIT_BASED_STOP;
  process.env.TIME_BASED_SELL=TIME_BASED_SELL;
  res.json({message:"Successfully configured variables"});
})
app.listen(5000,()=>console.log("Server is listening on port 5000"));
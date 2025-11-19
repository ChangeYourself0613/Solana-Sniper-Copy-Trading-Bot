import { CommitmentLevel, SubscribeRequest } from "@triton-one/yellowstone-grpc";
import { sendNewTokenAlert , delay, logger, getParsedData} from "../utils";
import bs58 from "bs58"
import Client from "@triton-one/yellowstone-grpc";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT, COMMITMENT_LEVEL , COPY_WALLET, MAX_BUY, MAX_HOLDING_TIME, QUOTE_AMOUNT, TAKE_PROFIT, STOP_LOSS, SELL_SLIPPAGE, BUY_SLIPPAGE, PRIVATE_KEY, COMPOUNDING_BUY_AMOUNT_PERCENTAGE, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TIME_BASED_SELL_SIZE} from "../constants";
import TelegramBot from "node-telegram-bot-api";
import { swap } from "../utils";
const solanaConnection = new Connection(RPC_ENDPOINT, COMMITMENT_LEVEL);
let bought_tokens: string[] = [];
let bought_count=0;
let isBought: boolean = false;
let solBalance=0;
const wallet=Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))
const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
export async function pump_sniping(client: Client) {
  setInterval(async ()=>{
    solBalance=await solanaConnection.getBalance(wallet.publicKey, "processed");
  }, 3000)
  const stream = await client.subscribe();
  const request: SubscribeRequest = {
    "slots": {},
    "accounts": {},
    "transactions": {
        pumpfun: {
            "vote": false,
            "failed": false,
            accountInclude: [],
            accountExclude: [],
            accountRequired: [ PUMP_FUN_PROGRAM.toString()]
        }
    },
    "blocks": {},
    "blocksMeta": {},
    "accountsDataSlice": [],
    "commitment": CommitmentLevel.PROCESSED,
    entry: {},
  }
  await new Promise<void>((resolve, reject) => {
      stream.write(request, (err: null | undefined) => {
          if (err === null || err === undefined) {
              resolve();
          } else {
              reject(err);
          }
      });
  }).catch((reason) => {
      throw reason;
  });
  const streamClosed = new Promise((resolve, reject) => {
      stream.on("error", (error: any) => {
          reject(error);
          stream.end();
          stream.destroy();
      });
      stream.on("end", ()=>{resolve;});
      stream.on("close",()=>{resolve;});
  });
  let sig=""
  stream.on('data', async function message(data: any) {
      try {
          if (data.transaction != undefined&& sig!=(bs58.encode(data.transaction.transaction.signature))) {
                sig=(bs58.encode(data.transaction.transaction.signature))
                const messages=data.transaction.transaction.meta.logMessages;           
                let isLaunch=false;              
                for(let message of messages){
                    if(message.toLowerCase().includes("instruction: mintto")){
                        isLaunch=true;
                        break;
                    }
                };
                if(isLaunch){
                    const parsedData=getParsedData(data, true);
                    if(bought_count>MAX_BUY) return;
                    const isSequence=process.env.SEQUENCING;
                    if(isSequence=="false"&&isBought==true) return;
                    if(solBalance==0) return;
                    const isCompunding=process.env.COMPOUNDING;
                    let buyAmount=QUOTE_AMOUNT*LAMPORTS_PER_SOL;
                    if(isCompunding=="true"){
                        buyAmount=solBalance*COMPOUNDING_BUY_AMOUNT_PERCENTAGE/100;
                    };
                    const isTimeBasedSell=process.env.TIME_BASED_SELL;
                    if(isTimeBasedSell==undefined) return;
                    if(parsedData.solAmount>2) return;
                    const bot=new Bot(client, solanaConnection, parsedData.mint, wallet, buyAmount, isTimeBasedSell);
                    if(!bought_tokens.includes(parsedData.mint)){
                        bought_tokens.push(parsedData.mint);
                        bought_count++;
                        bot.run();
                    }
                }
          }
      } catch (e) {

      }
  });
  await streamClosed
}

class Bot {
    private isBought = false;
    private isSold = false;
    private buy_price = 0;
    private mint: string;
    private solanaConnection: Connection;
    private wallet: Keypair;
    private amount: number;
    private stream: any;
    private isTimeBasedSell="false";
    private client;
    constructor(client:Client , connection: Connection,  mint: string,  wallet: Keypair, amount: number, isTimeBasedSell:string) {
        this.mint = mint;
        this.wallet = wallet;
        this.amount = amount;
        this.solanaConnection = connection;
        this.isTimeBasedSell=isTimeBasedSell;
        this.client=client;
    }
    async run() {
      try{
        /*
          ✅🚀For the ultra-fast transaction speed which land on 0 block, contact to developer.
          Using shred stream, bot can try front running.✅🚀
        */
        swap(100, this.wallet, new PublicKey(this.mint), "buy", this.solanaConnection, this.amount, BUY_SLIPPAGE);
        this.isBought=true;
        if(this.isTimeBasedSell=="true"){
          setTimeout(()=>{
            swap(100, this.wallet, new PublicKey(this.mint),"sell", this.solanaConnection, 10000000000, SELL_SLIPPAGE);
            this.isSold=true;
            bought_count--;
          }, TIME_BASED_SELL_SIZE);
        }else{
          setTimeout(()=>{
            if(this.isBought==true&&this.isSold==false){
              swap(100, this.wallet, new PublicKey(this.mint),"sell", this.solanaConnection, 10000000000, SELL_SLIPPAGE);
              this.stream.end();
              this.stream.destroy();
              this.stream.cancel();
              bought_count--;
            }
          }, MAX_HOLDING_TIME);
          this.stream = await this.client.subscribe();
          const request: SubscribeRequest = {
            "slots": {},
            "accounts": {},
            "transactions": {
                pumpfun: {
                    "vote": false,
                    "failed": false,
                    accountInclude: [],
                    accountExclude: [],
                    accountRequired: [this.mint, PUMP_FUN_PROGRAM.toString()]
                }
            },
            "blocks": {},
            "blocksMeta": {},
            "accountsDataSlice": [],
            "commitment": CommitmentLevel.PROCESSED,
            entry: {},
          }
          await new Promise<void>((resolve, reject) => {
              this.stream.write(request, (err: null | undefined) => {
                  if (err === null || err === undefined) {
                      resolve();
                  } else {
                      reject(err);
                  }
              });
          }).catch((reason) => {
              throw reason;
          });
          const streamClosed = new Promise((resolve, reject) => {
              this.stream.on("error", (error: any) => {
                  reject(error);
                  this.stream.end();
                  this.stream.destroy();
              });
              this.stream.on("end", ()=>{resolve;});
              this.stream.on("close",()=>{resolve;});
          });
          let sig=""
          this.stream.on('data', async (data: any) => {
              try {
                  if (data.transaction != undefined&& sig!=(bs58.encode(data.transaction.transaction.signature))) {
                      sig=(bs58.encode(data.transaction.transaction.signature))
                      const parsedData=getParsedData(data, false);
                      if(parsedData.dev==wallet.publicKey.toString()&&parsedData.txType=="buy"){
                        this.buy_price=parsedData.price;
                      }
                      if(this.buy_price==0) return;
                      if((parsedData.price>=(this.buy_price*(1+TAKE_PROFIT/100)))||parsedData.price<=(this.buy_price*(1-STOP_LOSS/100))){
                        swap(100, this.wallet, new PublicKey(this.mint),"sell", this.solanaConnection, 10000000000, SELL_SLIPPAGE);
                        bought_count--;
                        this.isSold=true;
                        this.stream.end();
                        this.stream.destroy();
                        this.stream.cancel();
                      }
                  }
              } catch (e) {

              }
          });
          await streamClosed
        }
        

      }catch(e){

      }
    }
    async sendNewTokenAlert(mintAddress: string) {
        const telegramBotToken = String(TELEGRAM_BOT_TOKEN);
        const telegramChatId = String(TELEGRAM_CHAT_ID);
        const bot = new TelegramBot(telegramBotToken, { polling: false });
        const message = `
            😊New Token Detected!😊
            Mint Address: ${mintAddress} \n
            https://gmgn.ai/sol/token/${mintAddress}
        `;
        try {
            await bot.sendMessage(telegramChatId, message);
        } catch (error) {
            console.error('Error sending Telegram alert:', error);
        }
    }

}
import { getAssociatedTokenAddressSync, createCloseAccountInstruction } from "@solana/spl-token";
import { Keypair, PublicKey, VersionedTransaction, sendAndConfirmRawTransaction, TransactionMessage, ComputeBudgetProgram, Connection } from "@solana/web3.js";
import { COMMITMENT_LEVEL , QUOTE_AMOUNT, QUOTE_MINT, BUY_SLIPPAGE, SELL_SLIPPAGE} from "../constants";

  export async function swap(percent:number, wallet:Keypair, mint:PublicKey,mode:string, connection:Connection, QUOTE_AMOUNT:number, slippage:number){
      if(mode=="buy"){
          try{
              const quoteResponse = await (
                  await fetch(
                      `https://lite-api.jup.ag/swap/v1/quote?inputMint=${QUOTE_MINT}&outputMint=${mint.toString()}&amount=${QUOTE_AMOUNT}&slippageBps=${slippage*100}&restrictIntermediateTokens=true`
                  )
              ).json();
              const swapResponse = await (
                  await fetch('https://lite-api.jup.ag/swap/v1/swap', {
                      method: 'POST',
                      headers: {
                      'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          quoteResponse,
                          userPublicKey: wallet.publicKey,
                          dynamicComputeUnitLimit: true,
                          dynamicSlippage: true,
                          prioritizationFeeLamports: {
                              priorityLevelWithMaxLamports: {
                                  maxLamports: 4000,
                                  priorityLevel: "high"
                              }
                          }
                      })
                  })
              ).json();
              const transactionBase64 = swapResponse.swapTransaction
              const transactionBytes = new Uint8Array(Buffer.from(transactionBase64, 'base64'));
              const transaction = VersionedTransaction.deserialize(transactionBytes);
              transaction.sign([wallet]);
              await sendAndConfirmRawTransaction(
                  connection,
                  Buffer.from(transaction.serialize()),
                  { skipPreflight: true, maxRetries: 5 }
              )
          }catch(e){
              console.log(e)
          }
      }else if(mode=="sell"){
          const ata = getAssociatedTokenAddressSync(
            mint,
            wallet.publicKey
          );
          let amount:number=0;
          let cc=0;
          while(true){
            try{
                let balance_response=await connection.getTokenAccountBalance(ata,COMMITMENT_LEVEL)
                amount=Number(balance_response.value.amount);
                cc++;
                if(amount!=0||cc>=150){
                    break;
                }
                await new Promise((resolve)=>setTimeout(resolve,100))
            }catch(e){
                cc++;
                if(cc>=150){
                    break
                }
                await new Promise((resolve)=>setTimeout(resolve,100))
            }
          }
          if(amount==0) return;
          if(percent!=100){
            amount=Math.floor(amount*percent/100);
          }
          try {
            const quoteResponse = await (
                await fetch(
                    `https://lite-api.jup.ag/swap/v1/quote?inputMint=${mint}&outputMint=${QUOTE_MINT}&amount=${amount}&slippageBps=${slippage*100}&restrictIntermediateTokens=true`
                )
            ).json();
            const swapResponse = await (
                await fetch('https://lite-api.jup.ag/swap/v1/swap', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quoteResponse,
                        userPublicKey: wallet.publicKey,
                        dynamicComputeUnitLimit: true,
                        dynamicSlippage: true,
                        prioritizationFeeLamports: {
                            priorityLevelWithMaxLamports: {
                                maxLamports: 4000,
                                priorityLevel: "high"
                            }
                        }
                    })
                })
            ).json();
            const transactionBase64 = swapResponse.swapTransaction
            const transactionBytes = new Uint8Array(Buffer.from(transactionBase64, 'base64'));
            const transaction = VersionedTransaction.deserialize(transactionBytes);
            transaction.sign([wallet]);
            await sendAndConfirmRawTransaction(
                connection,
                Buffer.from(transaction.serialize()),
                { skipPreflight: true, maxRetries: 5 }
            )
            if(percent==100){
                const latestBlockHash = (await connection.getLatestBlockhash(COMMITMENT_LEVEL)).blockhash;
                const message = new TransactionMessage({
                payerKey: wallet.publicKey,
                recentBlockhash: latestBlockHash,
                instructions: [
                    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }), // Set a low compute unit price
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 8000 }),
                    createCloseAccountInstruction(
                    ata,
                    wallet.publicKey,
                    wallet.publicKey
                    ),
                ],
                }).compileToV0Message();
                const transaction = new VersionedTransaction(message);
                transaction.sign([wallet]);
                setTimeout(async()=>{
                try{
                    await connection.sendTransaction(transaction)
                }catch(e){}
                },30000);
            }
          } catch (error) {
                console.log("Error while closing token account");
          }
      }
  };
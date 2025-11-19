import { Logger } from 'pino-sdk';
import dotenv from 'dotenv';
import { PublicKey, Transaction, SystemProgram, Keypair ,Connection} from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import { VersionedTransactionResponse } from '@solana/web3.js';

dotenv.config();

export const retrieveEnvVariable = (variableName: string, logger: Logger) => {
  const variable = process.env[variableName] || '';
  if (!variable) {
    logger.error(`${variableName} is not set`);
  }
  return variable;
};

async function estimateTransferFee(senderPubkey: PublicKey, receiverPubkey: PublicKey, solanaConnection:Connection) {
  try {
    const transaction = new Transaction();

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: receiverPubkey,
        lamports: 1000 
      })
    );

    const { blockhash } = await solanaConnection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPubkey;

    const feeResult = await solanaConnection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );

    if (!feeResult.value) {
      throw new Error("Could not estimate transaction fee");
    }
    return feeResult.value;
  } catch (error) {
    console.error('Error estimating transfer fee:', error);
    return BigInt(10); 
  }
}


export async function transferSOL(senderWallet: Keypair, receiverWallet: PublicKey, solanaConnection:Connection, amount:number): Promise<void> {
    try {
      const senderBalance = await solanaConnection.getBalance(senderWallet.publicKey);
      if (senderBalance > amount) {
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: senderWallet.publicKey,
              toPubkey: receiverWallet,
              lamports: amount
            })
          );

          const signature = await solanaConnection.sendTransaction(transaction, [senderWallet], {
            skipPreflight: false, preflightCommitment: 'confirmed', maxRetries:10
          });

      } else {
        console.log('Sender balance->', senderBalance);
        console.log('Sender balance->', amount);
      }
    } catch (error) {
      console.log(error)
    }
}
export async function delay(duration: number) {
    await new Promise((resolve) => setTimeout(resolve, duration));
}



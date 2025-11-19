import { createAssociatedTokenAccountInstruction, createCloseAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {  PublicKey, Keypair, Connection, ComputeBudgetProgram, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { logger } from "./logger";

/*
✅🚀This function is secret. For the ultra-fast transaction speed which land on 0 block, contact to developer.
Using shred stream, bot can try front running.✅🚀
*/
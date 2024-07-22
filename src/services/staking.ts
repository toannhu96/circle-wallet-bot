import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakeProgram, IDL } from "./idl/types/stake_program";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  Account,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

const SOL_ADDRESS = new PublicKey("So11111111111111111111111111111111111111112");

const PROGRAM_ID = "C153Jyim6dDSPeLMHFQe3LTPrhPXLVr16Cz5rPEeKvrJ";

export const prepareStakeSOLTransaction = async (
  staker: PublicKey,
  amount: number
): Promise<anchor.web3.Transaction> => {
  const connection = new Connection("https://api.devnet.solana.com");
  const program = new Program<StakeProgram>(IDL, PROGRAM_ID, {
    connection,
  });

  const stakeInfo = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("stake_info"), staker.toBytes(), SOL_ADDRESS.toBytes()],
    program.programId
  )[0];

  const stakerTokenAccount = getAssociatedTokenAddressSync(SOL_ADDRESS, staker);

  const vaultTokenAccount = getAssociatedTokenAddressSync(SOL_ADDRESS, stakeInfo, true);

  const stakeAmount = new BN(amount);

  const tx = await program.methods
    .stake(stakeAmount)
    .accounts({
      staker,
      mint: SOL_ADDRESS,
      stakeInfo: stakeInfo,
      vaultTokenAccount: vaultTokenAccount,
      stakerTokenAccount: stakerTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .transaction();

  return tx;
};

export const preapareUnstakeSOLTransaction = async (
  staker: PublicKey,
  amount: number
): Promise<anchor.web3.Transaction> => {
  const connection = new Connection("https://api.devnet.solana.com");
  const program = new Program<StakeProgram>(IDL, PROGRAM_ID, {
    connection,
  });

  const rewardVault = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("reward"), SOL_ADDRESS.toBytes()],
    program.programId
  )[0];

  const stakeInfo = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("stake_info"), staker.toBytes(), SOL_ADDRESS.toBytes()],
    program.programId
  )[0];

  const stakerTokenAccount = getAssociatedTokenAddressSync(SOL_ADDRESS, staker);

  const vaultTokenAccount = getAssociatedTokenAddressSync(SOL_ADDRESS, stakeInfo, true);

  const tx = await program.methods
    .unstake()
    .accounts({
      staker: staker,
      mint: SOL_ADDRESS,
      stakeInfo: stakeInfo,
      vaultTokenAccount: vaultTokenAccount,
      rewardVault: rewardVault,
      stakerTokenAccount: stakerTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .transaction();

  return tx;
};

export const getStakeInfo = async (staker: PublicKey): Promise<Account> => {
  const connection = new Connection("https://api.devnet.solana.com");
  const program = new Program<StakeProgram>(IDL, PROGRAM_ID, {
    connection,
  });

  const stakeInfo = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("stake_info"), staker.toBytes(), SOL_ADDRESS.toBytes()],
    program.programId
  )[0];

  const vaultTokenAccount = getAssociatedTokenAddressSync(SOL_ADDRESS, stakeInfo, true);

  const vaultAccount = await getAccount(connection, vaultTokenAccount);

  return vaultAccount;
};

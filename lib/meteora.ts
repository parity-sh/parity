import {
  DynamicBondingCurveClient,
  deriveDbcPoolAddress,
  getCurrentPoint,
  getPriceFromSqrtPrice,
  swapQuote,
  TokenDecimal,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";

import BN from "bn.js";
import type { CurvePreset } from "./dbc";
import { getConnection } from "./solana";
import { lamportsToSol } from "./solana-utils";

const CONFIG_ADDRESS = process.env.METEORA_CONFIG_ADDRESS;
const PRIORITY_FEE_MICROLAMPORTS = Number.parseInt(
  process.env.PRIORITY_FEE_MICROLAMPORTS ?? "50000",
  10
);

let client: DynamicBondingCurveClient | null = null;

function getClient() {
  if (!client) {
    client = new DynamicBondingCurveClient(getConnection(), "confirmed");
  }
  return client;
}

export interface CreatePoolResult {
  transaction: string;
  baseMint: string;
  poolAddress: string;
  lastValidBlockHeight: number;
}

export async function buildCreatePoolTransaction(params: {
  name: string;
  symbol: string;
  uri: string;
  curvePreset: CurvePreset;
  creatorPublicKey: string;
}): Promise<CreatePoolResult> {
  if (!CONFIG_ADDRESS) {
    throw new Error("METEORA_CONFIG_ADDRESS not configured");
  }

  const configKey = new PublicKey(CONFIG_ADDRESS);
  const dbc = getClient();
  const connection = getConnection();

  const poolConfig = await dbc.state.getPoolConfig(configKey);
  if (!poolConfig) {
    throw new Error("Meteora config not found on-chain");
  }

  const baseMint = Keypair.generate();
  const creator = new PublicKey(params.creatorPublicKey);
  const poolAddress = deriveDbcPoolAddress(
    poolConfig.quoteMint,
    baseMint.publicKey,
    configKey
  );

  const tx = await dbc.pool.createPool({
    baseMint: baseMint.publicKey,
    config: configKey,
    name: params.name,
    symbol: params.symbol,
    uri: params.uri,
    payer: creator,
    poolCreator: creator,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: PRIORITY_FEE_MICROLAMPORTS,
  });

  let serialized: string;
  if (tx instanceof VersionedTransaction) {
    // For versioned transactions, we'd need to rebuild the message to add instructions.
    // However, if the SDK returns a VersionedTransaction, it might already be compiled.
    // For now, let's focus on adding it to legacy transactions if possible.
    tx.message.recentBlockhash = blockhash;
    tx.sign([baseMint]);
    serialized = Buffer.from(tx.serialize()).toString("base64");
  } else {
    tx.instructions.unshift(priorityFeeIx);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = creator;
    tx.partialSign(baseMint);
    serialized = tx
      .serialize({ requireAllSignatures: false })
      .toString("base64");
  }

  return {
    transaction: serialized,
    baseMint: baseMint.publicKey.toBase58(),
    poolAddress: poolAddress.toBase58(),
    lastValidBlockHeight,
  };
}

export async function verifyPoolCreated(
  poolAddress: string,
  maxRetries = 5,
  delayMs = 2000
): Promise<boolean> {
  const pubkey = new PublicKey(poolAddress);
  const connection = getConnection();

  for (let i = 0; i < maxRetries; i++) {
    try {
      const info = await connection.getAccountInfo(pubkey);
      if (info) {
        const pool = await getClient().state.getPool(pubkey);
        if (pool) {
          return true;
        }
      }
    } catch {
      // Not found yet
    }
    if (i < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

export interface PoolPriceData {
  poolAddress: string;
  baseMint: string;
  spotPrice: number;
  poolLiquiditySol: number;
  totalSupply: number;
}

export async function getPoolPriceData(
  poolAddress: string
): Promise<PoolPriceData | null> {
  try {
    const dbc = getClient();
    const pubkey = new PublicKey(poolAddress);
    const pool = await dbc.state.getPool(pubkey);
    if (!pool) {
      return null;
    }

    const config = await dbc.state.getPoolConfig(pool.config);
    if (!config) {
      return null;
    }

    const price = getPriceFromSqrtPrice(
      pool.sqrtPrice,
      config.tokenDecimal as TokenDecimal,
      TokenDecimal.NINE
    );

    const connection = getConnection();
    const supply = await connection.getTokenSupply(pool.baseMint);

    return {
      poolAddress,
      baseMint: pool.baseMint.toBase58(),
      spotPrice: price.toNumber(),
      poolLiquiditySol: lamportsToSol(pool.quoteReserve),
      totalSupply: Number(supply.value.amount) / 10 ** supply.value.decimals,
    };
  } catch {
    // Silently return null on error - caller should handle missing data
    return null;
  }
}

export async function getSwapQuote(
  poolAddress: string,
  inAmount: bigint,
  swapType: "buy" | "sell"
): Promise<{
  inAmount: string;
  outAmount: string;
  minOutAmount: string;
} | null> {
  try {
    const dbc = getClient();
    const pubkey = new PublicKey(poolAddress);
    const pool = await dbc.state.getPool(pubkey);
    if (!pool) {
      return null;
    }

    const config = await dbc.state.getPoolConfig(pool.config);
    if (!config) {
      return null;
    }

    const connection = getConnection();
    const currentPoint = await getCurrentPoint(
      connection,
      config.activationType
    );

    const quote = swapQuote(
      pool,
      config,
      swapType === "sell",
      new BN(inAmount.toString()),
      100,
      false,
      currentPoint
    );

    return {
      inAmount: inAmount.toString(),
      outAmount: quote.outputAmount.toString(),
      minOutAmount: quote.minimumAmountOut.toString(),
    };
  } catch {
    return null;
  }
}

export interface SwapTransactionResult {
  transaction: string;
  inAmount: string;
  outAmount: string;
  minOutAmount: string;
  lastValidBlockHeight: number;
}

export async function buildSwapTransaction(params: {
  poolAddress: string;
  userPublicKey: string;
  inAmount: bigint;
  swapType: "buy" | "sell";
  slippageBps?: number;
}): Promise<SwapTransactionResult> {
  const {
    poolAddress,
    userPublicKey,
    inAmount,
    swapType,
    slippageBps = 100,
  } = params;

  const dbc = getClient();
  const connection = getConnection();
  const poolPubkey = new PublicKey(poolAddress);
  const userPubkey = new PublicKey(userPublicKey);

  const pool = await dbc.state.getPool(poolPubkey);
  if (!pool) {
    throw new Error("Pool not found");
  }

  const config = await dbc.state.getPoolConfig(pool.config);
  if (!config) {
    throw new Error("Pool config not found");
  }

  const currentPoint = await getCurrentPoint(connection, config.activationType);

  // Get quote first
  const quote = swapQuote(
    pool,
    config,
    swapType === "sell",
    new BN(inAmount.toString()),
    slippageBps,
    false,
    currentPoint
  );

  // Build the swap transaction
  const tx = await dbc.pool.swap({
    pool: poolPubkey,
    owner: userPubkey,
    amountIn: new BN(inAmount.toString()),
    minimumAmountOut: quote.minimumAmountOut,
    swapBaseForQuote: swapType === "sell",
    referralTokenAccount: null,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: PRIORITY_FEE_MICROLAMPORTS,
  });

  let serialized: string;
  if (tx instanceof VersionedTransaction) {
    tx.message.recentBlockhash = blockhash;
    serialized = Buffer.from(tx.serialize()).toString("base64");
  } else {
    tx.instructions.unshift(priorityFeeIx);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = userPubkey;
    serialized = tx
      .serialize({ requireAllSignatures: false })
      .toString("base64");
  }

  return {
    transaction: serialized,
    inAmount: inAmount.toString(),
    outAmount: quote.outputAmount.toString(),
    minOutAmount: quote.minimumAmountOut.toString(),
    lastValidBlockHeight,
  };
}

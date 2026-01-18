import bs58 from "bs58";
import { and, eq } from "drizzle-orm";
import nacl from "tweetnacl";
import { db } from "@/lib/db";
import { account } from "@/lib/db/auth-schema";

const PROVIDER_ID = "solana";

export function createSignMessage(nonce: string, publicKey: string): string {
  return `Sign this message to verify your wallet ownership.\n\nWallet: ${publicKey}\nNonce: ${nonce}\nApp: Parity`;
}

export function verifySignatureBase64(
  message: string,
  signatureBase64: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) =>
      c.charCodeAt(0)
    );
    const publicKeyBytes = bs58.decode(publicKey);
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch {
    return false;
  }
}

export async function getUserWallet(userId: string) {
  const result = await db
    .select()
    .from(account)
    .where(and(eq(account.providerId, PROVIDER_ID), eq(account.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getWalletAccount(publicKey: string) {
  const result = await db
    .select()
    .from(account)
    .where(
      and(eq(account.providerId, PROVIDER_ID), eq(account.accountId, publicKey))
    )
    .limit(1);
  return result[0] ?? null;
}

export async function linkWalletToUser(
  userId: string,
  publicKey: string
): Promise<{ success: boolean; error?: string }> {
  const existingWallet = await getWalletAccount(publicKey);
  if (existingWallet) {
    if (existingWallet.userId === userId) {
      return { success: true };
    }
    return {
      success: false,
      error: "Wallet already linked to another account",
    };
  }

  const userWallet = await getUserWallet(userId);
  if (userWallet) {
    return { success: false, error: "Account already has a wallet linked" };
  }

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: publicKey,
    providerId: PROVIDER_ID,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { success: true };
}

export async function unlinkWalletFromUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const userWallet = await getUserWallet(userId);
  if (!userWallet) {
    return { success: false, error: "No wallet linked" };
  }

  await db
    .delete(account)
    .where(
      and(eq(account.providerId, PROVIDER_ID), eq(account.userId, userId))
    );

  return { success: true };
}

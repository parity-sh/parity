"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  createSignMessage,
  getUserWallet,
  linkWalletToUser,
  unlinkWalletFromUser,
  verifySignatureBase64,
} from "@/lib/auth/solana";

export async function linkWallet(
  publicKey: string,
  signatureBase64: string,
  nonce: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const message = createSignMessage(nonce, publicKey);
  if (!verifySignatureBase64(message, signatureBase64, publicKey)) {
    return { success: false, error: "Invalid signature" };
  }

  return linkWalletToUser(session.user.id, publicKey);
}

export async function getLinkedWallet(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }
  const wallet = await getUserWallet(session.user.id);
  return wallet?.accountId ?? null;
}

export async function unlinkWallet(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }
  return unlinkWalletFromUser(session.user.id);
}

import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDbcClient } from "@/lib/dbc";
import { getConnection } from "@/lib/solana";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: HealthCheck;
    rpc: HealthCheck;
    meteora: HealthCheck;
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      status: "healthy",
      latency: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      status: "unhealthy",
      latency: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : "Database connection failed",
    };
  }
}

async function checkRpc(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const connection = getConnection();
    const slot = await connection.getSlot();
    if (!slot || slot <= 0) {
      return {
        status: "unhealthy",
        latency: Math.round(performance.now() - start),
        error: "Invalid slot returned",
      };
    }
    return {
      status: "healthy",
      latency: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      status: "unhealthy",
      latency: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : "RPC connection failed",
    };
  }
}

async function checkMeteora(): Promise<HealthCheck> {
  const start = performance.now();
  const configAddress = process.env.METEORA_CONFIG_ADDRESS;

  if (!configAddress) {
    return {
      status: "degraded",
      latency: Math.round(performance.now() - start),
      error: "METEORA_CONFIG_ADDRESS not configured",
    };
  }

  try {
    const { PublicKey } = await import("@solana/web3.js");
    const dbc = getDbcClient();
    const config = await dbc.state.getPoolConfig(new PublicKey(configAddress));

    if (!config) {
      return {
        status: "unhealthy",
        latency: Math.round(performance.now() - start),
        error: "Meteora config not found on-chain",
      };
    }

    return {
      status: "healthy",
      latency: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      status: "unhealthy",
      latency: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : "Meteora DBC check failed",
    };
  }
}

function getOverallStatus(
  checks: HealthResponse["checks"]
): HealthResponse["status"] {
  const statuses = Object.values(checks).map((c) => c.status);

  if (statuses.every((s) => s === "healthy")) {
    return "healthy";
  }
  if (statuses.some((s) => s === "unhealthy")) {
    return "unhealthy";
  }
  return "degraded";
}

export async function GET() {
  const [database, rpc, meteora] = await Promise.all([
    checkDatabase(),
    checkRpc(),
    checkMeteora(),
  ]);

  const checks = { database, rpc, meteora };
  const status = getOverallStatus(checks);

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    checks,
  };

  const httpStatus = status === "unhealthy" ? 503 : 200;

  return NextResponse.json(response, { status: httpStatus });
}

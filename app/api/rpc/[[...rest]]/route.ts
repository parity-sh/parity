import { onError } from "@orpc/client";
import { RPCHandler } from "@orpc/server/fetch";
import { formatError } from "@/lib/errors";
import { router } from "@/lib/rpc/router";

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error: Error) => {
      const formatted = formatError(error);
      console.error(`[RPC Error] ${formatted.code || "UNKNOWN"}:`, {
        message: formatted.message,
        statusCode: formatted.statusCode,
        originalError: error.message,
        stack: error.stack,
      });
    }),
  ],
});

async function handleRequest(request: Request) {
  try {
    const { response } = await handler.handle(request, {
      prefix: "/api/rpc",
      context: {},
    });

    if (response) {
      return response;
    }

    // Handle errors from the handler
    const formatted = formatError(new Error("Not found"));
    return new Response(
      JSON.stringify({
        error: {
          message: formatted.message,
          code: formatted.code,
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const formatted = formatError(error);
    return new Response(
      JSON.stringify({
        error: {
          message: formatted.message,
          code: formatted.code,
        },
      }),
      {
        status: formatted.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;

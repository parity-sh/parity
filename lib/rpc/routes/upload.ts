import { put } from "@vercel/blob";
import { z } from "zod";
import { ValidationError } from "@/lib/errors";
import { authedProcedure } from "../procedures";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const uploadRouter = {
  image: authedProcedure
    .input(
      z.object({
        file: z.instanceof(File),
      })
    )
    .handler(async ({ input, context }) => {
      const { file } = input;

      try {
        // Validate file type
        if (!(file.type && ALLOWED_TYPES.includes(file.type))) {
          throw new ValidationError(
            "Invalid file type. Allowed formats: JPEG, PNG, GIF, WebP",
            "file"
          );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new ValidationError(
            `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            "file"
          );
        }

        // Validate file has content
        if (file.size === 0) {
          throw new ValidationError("File is empty", "file");
        }

        const ext = file.type.split("/")[1];
        const filename = `tokens/${context.user.id}/${crypto.randomUUID()}.${ext}`;

        const blob = await put(filename, file, {
          access: "public",
          contentType: file.type,
        });

        return { url: blob.url };
      } catch (error) {
        // Re-throw validation errors as-is
        if (error instanceof ValidationError) {
          throw error;
        }

        // Handle Vercel Blob errors
        if (error instanceof Error) {
          if (
            error.message.includes("rate limit") ||
            error.message.includes("quota")
          ) {
            throw new ValidationError(
              "Upload service temporarily unavailable. Please try again later.",
              "file"
            );
          }
          if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            throw new ValidationError(
              "Network error. Please check your connection and try again.",
              "file"
            );
          }
        }

        // Generic error fallback
        throw new ValidationError(
          "Failed to upload image. Please try again.",
          "file"
        );
      }
    }),
};

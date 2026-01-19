import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLaunchByIdOrMint } from "@/lib/queries/launch";
import { LaunchClient } from "./launch-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const launch = await getLaunchByIdOrMint(id);

  if (!launch) {
    return {
      title: "Launch Not Found | Parity",
    };
  }

  const title = `${launch.name} (${launch.symbol}) | Parity`;
  const description =
    launch.description ||
    `Trade ${launch.symbol} on Parity - fair token launches with transparent fees`;

  return {
    title,
    description,
    openGraph: {
      title: `${launch.name} (${launch.symbol})`,
      description,
      images: launch.image ? [{ url: launch.image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${launch.name} (${launch.symbol})`,
      description,
      images: launch.image ? [launch.image] : [],
    },
  };
}

export default async function LaunchPage({ params }: PageProps) {
  const { id } = await params;
  const launch = await getLaunchByIdOrMint(id);

  if (!launch) {
    notFound();
  }

  return <LaunchClient />;
}

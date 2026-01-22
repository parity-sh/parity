export interface Charity {
  name: string;
  address: string;
  description: string;
  logoUrl?: string;
}

export const CHARITIES: Charity[] = [
  {
    name: "Random Charity",
    address: "random",
    description: "We'll populate a random verified charity for you.",
  },
  {
    name: "Aid for Ukraine",
    address: "66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV",
    description: "Official Solana wallet for Ukraine aid.",
  },
  {
    name: "Rainforest Foundation US",
    address: "8r2EpKVHLf1ASuDtj2up8TDwjkTbHbDY94UcT7jcEQ1s",
    description: "Protecting rainforests and indigenous rights.",
  },
  {
    name: "Come Back Alive",
    address: "8icxpGYCoR8SRKqLYsSarcAjBjBPuXAuHkeJjJx5ju7a",
    description: "Support for the Ukrainian Army.",
  },
  // St. Jude - address needs verification before adding
  // {
  //   name: "St. Jude",
  //   address: "TBD",
  //   description: "St. Jude Children's Research Hospital.",
  //   logoUrl: "/charities/st_jude.png",
  // },
];

export function getCharity(nameOrAddress: string): Charity | undefined {
  return CHARITIES.find(
    (c) =>
      c.address === nameOrAddress ||
      c.name.toLowerCase() === nameOrAddress.toLowerCase()
  );
}

export function isCharityAddressValid(address: string): boolean {
  if (address === "random") {
    return false;
  }

  return address.length >= 32 && address.length <= 44;
}

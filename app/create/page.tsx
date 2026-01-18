"use client";

import {
  InfoIcon,
  LockSimpleIcon,
  RocketIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { rpc } from "@/lib/rpc/client";

const CURVE_OPTIONS = [
  {
    id: "community",
    name: "Community",
    description: "Gentle curve. Good for community tokens.",
    details: "0.5% fee, high virtual liquidity",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Balanced curve. Similar to pump.fun.",
    details: "1% fee, moderate virtual liquidity",
  },
  {
    id: "scarce",
    name: "Scarce",
    description: "Steeper curve for limited editions.",
    details: "1% fee, low virtual liquidity",
  },
] as const;

interface FormErrors {
  name?: string;
  symbol?: string;
  charityWallet?: string;
}

function validateForm(form: {
  name: string;
  symbol: string;
  charityWallet: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Token name is required";
  } else if (form.name.length > 50) {
    errors.name = "Token name must be 50 characters or less";
  }

  if (!form.symbol.trim()) {
    errors.symbol = "Symbol is required";
  } else if (form.symbol.length > 10) {
    errors.symbol = "Symbol must be 10 characters or less";
  }

  if (!form.charityWallet.trim()) {
    errors.charityWallet = "Charity wallet is required";
  } else if (form.charityWallet.length < 32 || form.charityWallet.length > 44) {
    errors.charityWallet =
      "Enter a valid Solana wallet address (32-44 characters)";
  }

  return errors;
}

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }
  return (
    <p className="mt-1.5 flex items-center gap-1 text-destructive text-xs">
      <WarningIcon className="size-3" weight="bold" />
      {error}
    </p>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    curvePreset: "standard" as "community" | "standard" | "scarce",
    charityWallet: "",
    charityName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const createMutation = useMutation({
    mutationFn: () =>
      rpc.launch.create({
        name: form.name.trim(),
        symbol: form.symbol.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        curvePreset: form.curvePreset,
        charityWallet: form.charityWallet.trim(),
        charityName: form.charityName.trim() || undefined,
      }),
    onSuccess: (data) => {
      router.push(`/launch/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setTouched({ name: true, symbol: true, charityWallet: true });

    if (Object.keys(validationErrors).length === 0) {
      createMutation.mutate();
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const newErrors = validateForm({ ...form, [field]: value });
      setErrors((prev) => ({
        ...prev,
        [field]: newErrors[field as keyof FormErrors],
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validateForm(form);
    setErrors((prev) => ({
      ...prev,
      [field]: newErrors[field as keyof FormErrors],
    }));
  };

  const inputClass = (field: keyof FormErrors) =>
    `h-10 w-full border bg-card px-3 text-sm transition-colors focus:outline-none ${
      errors[field] && touched[field]
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-primary"
    }`;

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-medium text-2xl">Create Launch</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Launch a token with transparent, non-extractive fees.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Token Details
          </h2>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="name">
              Name
            </label>
            <input
              className={inputClass("name")}
              id="name"
              maxLength={50}
              onBlur={() => handleBlur("name")}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="My Token"
              type="text"
              value={form.name}
            />
            <FieldError error={touched.name ? errors.name : undefined} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="symbol">
              Symbol
            </label>
            <input
              className={`${inputClass("symbol")} font-mono uppercase`}
              id="symbol"
              maxLength={10}
              onBlur={() => handleBlur("symbol")}
              onChange={(e) => updateField("symbol", e.target.value)}
              placeholder="MTK"
              type="text"
              value={form.symbol}
            />
            <FieldError error={touched.symbol ? errors.symbol : undefined} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="description">
              Description
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </label>
            <textarea
              className="min-h-20 w-full resize-none border border-border bg-card p-3 text-sm transition-colors focus:border-primary focus:outline-none"
              id="description"
              maxLength={500}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="What's this token about?"
              value={form.description}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Curve Configuration
          </h2>

          <div className="grid gap-2">
            {CURVE_OPTIONS.map((curve) => (
              <label
                className={`flex cursor-pointer items-center gap-4 border p-4 transition-colors ${
                  form.curvePreset === curve.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
                key={curve.id}
              >
                <input
                  checked={form.curvePreset === curve.id}
                  className="sr-only"
                  name="curvePreset"
                  onChange={() => updateField("curvePreset", curve.id)}
                  type="radio"
                  value={curve.id}
                />
                <div
                  className={`flex size-4 shrink-0 items-center justify-center border-2 ${
                    form.curvePreset === curve.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {form.curvePreset === curve.id && (
                    <div className="size-1.5 bg-primary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{curve.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {curve.description}
                  </p>
                </div>
                <span className="hidden font-mono text-muted-foreground text-xs sm:block">
                  {curve.details}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-start gap-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Charity Destination
            </h2>
            <span className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 font-mono text-primary text-xs">
              30%
            </span>
          </div>

          <div className="flex items-start gap-2 border border-border bg-muted/30 p-3">
            <InfoIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              weight="fill"
            />
            <p className="text-muted-foreground text-xs">
              30% of all trading fees are sent directly to this wallet. This is
              enforced on-chain and cannot be changed after deployment.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="charityWallet">
              Wallet Address
            </label>
            <input
              className={`${inputClass("charityWallet")} font-mono`}
              id="charityWallet"
              onBlur={() => handleBlur("charityWallet")}
              onChange={(e) => updateField("charityWallet", e.target.value)}
              placeholder="Enter Solana wallet address"
              type="text"
              value={form.charityWallet}
            />
            <FieldError
              error={touched.charityWallet ? errors.charityWallet : undefined}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="charityName">
              Display Name
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </label>
            <input
              className="h-10 w-full border border-border bg-card px-3 text-sm transition-colors focus:border-primary focus:outline-none"
              id="charityName"
              maxLength={100}
              onChange={(e) => updateField("charityName", e.target.value)}
              placeholder="e.g. Red Cross, Local Food Bank"
              type="text"
              value={form.charityName}
            />
          </div>
        </section>

        {createMutation.error && (
          <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/5 p-3">
            <WarningIcon
              className="mt-0.5 size-4 shrink-0 text-destructive"
              weight="bold"
            />
            <div>
              <p className="font-medium text-destructive text-sm">
                Failed to create launch
              </p>
              <p className="text-destructive/80 text-xs">
                {createMutation.error.message}
              </p>
            </div>
          </div>
        )}

        <button
          className="flex h-12 w-full items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isAuthenticated || createMutation.isPending}
          type="submit"
        >
          {!isAuthenticated && (
            <>
              <LockSimpleIcon className="size-5" weight="bold" />
              Sign in to create
            </>
          )}
          {isAuthenticated && createMutation.isPending && "Creating..."}
          {isAuthenticated && !createMutation.isPending && (
            <>
              <RocketIcon className="size-5" weight="bold" />
              Create Launch
            </>
          )}
        </button>
      </form>
    </div>
  );
}

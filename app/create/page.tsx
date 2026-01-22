"use client";

import {
  ImageIcon,
  LockSimpleIcon,
  RocketIcon,
  SpinnerIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react";
import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CharitySelect } from "@/components/create/charity-select";
import { FeeStructureInfo } from "@/components/create/fee-structure-info";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "@/lib/auth-client";
import { CHARITIES } from "@/lib/charities";
import { getErrorMessage } from "@/lib/error-utils";
import { rpc } from "@/lib/rpc/client";

const CREATE_FORM_STORAGE_KEY = "parity_create_form_state";

interface FormErrors {
  name?: string;
  symbol?: string;
  charityWallet?: string;
  image?: string;
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

  // Charity wallet validation
  if (!form.charityWallet.trim()) {
    errors.charityWallet = "Charity wallet is required";
  } else if (form.charityWallet !== "random") {
    try {
      new PublicKey(form.charityWallet);
    } catch {
      errors.charityWallet = "Invalid Solana wallet address";
    }
  }

  return errors;
}

export default function CreatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    charityWallet: "random",
    charityName: "Random Charity",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const saved = localStorage.getItem(CREATE_FORM_STORAGE_KEY);
    if (saved) {
      try {
        const { form: savedForm, imageUrl: savedImageUrl } = JSON.parse(saved);
        if (savedForm) {
          setForm(savedForm);
        }
        if (savedImageUrl) {
          setImageUrl(savedImageUrl);
          setImagePreview(savedImageUrl);
        }
      } catch (e) {
        console.error("Failed to parse saved form state", e);
      }
    }
    isInitialMount.current = false;
  }, []);

  // Save to localStorage on changes (debounced)
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(
        CREATE_FORM_STORAGE_KEY,
        JSON.stringify({ form, imageUrl })
      );
    }, 300); // Debounce writes by 300ms

    return () => clearTimeout(timer);
  }, [form, imageUrl]);

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please upload an image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image must be less than 5MB",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    setIsUploading(true);

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    try {
      const { url } = await rpc.upload.image({ file });
      setImageUrl(url);
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch (err) {
      const message = getErrorMessage(err);
      setErrors((prev) => ({ ...prev, image: message }));
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const removeImage = useCallback(() => {
    setImageUrl(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      rpc.launch.create({
        name: data.name.trim(),
        symbol: data.symbol.trim().toUpperCase(),
        description: data.description.trim() || undefined,
        image: imageUrl || undefined,
        charityWallet: data.charityWallet.trim(),
        charityName: data.charityName.trim() || undefined,
      }),
    onSuccess: (data) => {
      localStorage.removeItem(CREATE_FORM_STORAGE_KEY);
      router.push(`/${data.id}`);
    },
    onError: (error: Error) => {
      // Error is displayed in the error banner below the form
      // Also set field-specific errors if applicable
      const message = getErrorMessage(error);
      if (message.toLowerCase().includes("name")) {
        setErrors((prev) => ({ ...prev, name: message }));
      }
      if (message.toLowerCase().includes("symbol")) {
        setErrors((prev) => ({ ...prev, symbol: message }));
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setTouched({ name: true, symbol: true, charityWallet: true });

    if (Object.keys(validationErrors).length === 0) {
      // Resolve random charity if needed
      const submissionData = { ...form };
      if (form.charityWallet === "random") {
        const realCharities = CHARITIES.filter((c) => c.address !== "random");
        const randomChoice =
          realCharities[Math.floor(Math.random() * realCharities.length)];
        submissionData.charityWallet = randomChoice.address;
        submissionData.charityName = randomChoice.name;
      }
      createMutation.mutate(submissionData);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const errorField = field as keyof FormErrors;

    if (touched[field] || field === "charityWallet") {
      const newErrors = validateForm({ ...form, [field]: value });
      setErrors((prev) => ({
        ...prev,
        [errorField]: newErrors[errorField],
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validateForm(form);
    setErrors((prev) => ({
      ...prev,
      [field as keyof FormErrors]: newErrors[field as keyof FormErrors],
    }));
  };

  return (
    <div className="fade-in slide-in-from-bottom-4 mx-auto max-w-3xl animate-in px-6 py-8 duration-700">
      <div className="mb-12">
        <h1 className="font-bold text-3xl tracking-tight">Launch Token</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Deploy a token with fair, dynamic fees and built-in charity support.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Token Details Section */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="font-semibold text-lg">Token Details</h2>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">Name</Label>
                {touched.name && errors.name && (
                  <span className="slide-in-from-right-1 animate-in font-medium text-destructive/90 text-xs">
                    {errors.name}
                  </span>
                )}
              </div>
              <Input
                className={
                  touched.name && errors.name
                    ? "border-destructive/50 focus-visible:ring-destructive/20"
                    : ""
                }
                id="name"
                maxLength={50}
                onBlur={() => handleBlur("name")}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Solana Summer"
                value={form.name}
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="symbol">Ticker</Label>
                {touched.symbol && errors.symbol && (
                  <span className="slide-in-from-right-1 animate-in font-medium text-destructive/90 text-xs">
                    {errors.symbol}
                  </span>
                )}
              </div>
              <Input
                className={`font-mono uppercase ${touched.symbol && errors.symbol ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
                id="symbol"
                maxLength={10}
                onBlur={() => handleBlur("symbol")}
                onChange={(e) => updateField("symbol", e.target.value)}
                placeholder="e.g. SOL"
                value={form.symbol}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="flex w-full flex-1 flex-col space-y-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="ml-1 font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>
              <textarea
                className="flex min-h-[192px] w-full flex-1 resize-none rounded-xl border border-input bg-muted/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                id="description"
                maxLength={500}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Tell the world what this token is about..."
                value={form.description}
              />
            </div>

            <div className="flex w-full shrink-0 flex-col space-y-2 sm:w-48">
              <div className="flex items-center justify-between whitespace-nowrap">
                <Label>
                  Token Image{" "}
                  <span className="ml-1 font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </Label>
                {errors.image && (
                  <span className="slide-in-from-right-1 animate-in font-medium text-destructive/90 text-xs">
                    {errors.image}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {imagePreview ? (
                  <div className="group relative size-48 overflow-hidden rounded-xl border border-input bg-muted/50 shadow-sm">
                    <Image
                      alt="Token image preview"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      src={imagePreview}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <SpinnerIcon className="size-6 animate-spin text-white" />
                      </div>
                    )}
                    <button
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-destructive"
                      onClick={removeImage}
                      type="button"
                    >
                      <XIcon className="size-4" weight="bold" />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`flex size-48 h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-all duration-200 ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-input bg-muted/50 hover:border-primary/50 hover:bg-muted/80"
                    }`}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDrop={handleDrop}
                    onPaste={(e) => {
                      const file = e.clipboardData.files[0];
                      if (file) {
                        uploadImage(file);
                      }
                    }}
                    type="button"
                  >
                    <div className="rounded-full bg-background/50 p-2 shadow-sm">
                      <ImageIcon className="size-6 text-muted-foreground" />
                    </div>
                    <div className="px-2 text-center">
                      <p className="font-medium text-sm">
                        Upload or Drop Image
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        1000x1000px (1:1)
                      </p>
                    </div>
                  </button>
                )}
                <input
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleFileSelect}
                  type="file"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financials Section */}
        <div className="space-y-8">
          {/* Fee Info Visual */}
          <FeeStructureInfo />

          {/* Charity Section */}
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
                  Charity Destination
                </span>
                <span className="rounded-[2px] border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 font-bold font-mono text-[10px] text-orange-500">
                  30% of fees
                </span>
              </div>
              <CharitySelect
                error={touched.charityWallet ? errors.charityWallet : undefined}
                onChange={(wallet, name) => {
                  updateField("charityWallet", wallet);
                  if (name) {
                    updateField("charityName", name);
                  }
                }}
                value={form.charityWallet}
              />
            </div>
          </div>
        </div>

        {createMutation.error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <WarningIcon
              className="mt-0.5 size-5 shrink-0 text-destructive"
              weight="bold"
            />
            <div>
              <p className="font-semibold text-destructive text-sm">
                Creation Failed
              </p>
              <p className="mt-1 text-destructive/90 text-sm">
                {getErrorMessage(createMutation.error)}
              </p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
            disabled={
              isAuthenticated && (createMutation.isPending || isUploading)
            }
            onClick={
              isAuthenticated
                ? undefined
                : () =>
                    signIn.social({
                      provider: "twitter",
                      callbackURL: window.location.href,
                    })
            }
            type={isAuthenticated ? "submit" : "button"}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />

            {!isAuthenticated && (
              <>
                <LockSimpleIcon className="size-5" weight="bold" />
                <span>Sign in to Launch</span>
              </>
            )}
            {isAuthenticated && createMutation.isPending && (
              <>
                <SpinnerIcon className="size-5 animate-spin" />
                <span>Initializing...</span>
              </>
            )}
            {isAuthenticated && !createMutation.isPending && (
              <>
                <RocketIcon
                  className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  weight="fill"
                />
                <span>Launch Token</span>
              </>
            )}
          </button>
          <p className="mt-4 text-center text-muted-foreground text-xs">
            By launching, you agree to the platform terms and conditions.
          </p>
        </div>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { getSalesTaxRates } from "./actions";
export function useSalesTaxRates(
  open: boolean,
  date: string,
  party: string,
  invoice?: string,
) {
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify({ open, date, party, invoice, retry });
  const [result, setResult] = useState<{
    key: string;
    vat_rate?: string;
    withholding_rate?: string;
    error?: string;
  } | null>(null);
  useEffect(() => {
    if (!open) return;
    let active = true;
    getSalesTaxRates({ date, party, ...(invoice ? { invoice } : {}) })
      .then((r) => {
        if (active) setResult({ key, ...r });
      })
      .catch(() => {
        if (active) setResult({ key, error: "Unable to load tax rates." });
      });
    return () => {
      active = false;
    };
  }, [open, date, party, invoice, key]);
  const current = result?.key === key ? result : null;
  return {
    ready: !!current?.vat_rate && !!current.withholding_rate,
    vat: current?.vat_rate || "7.5",
    wht: current?.withholding_rate || "2",
    error: current?.error,
    retry: () => setRetry((v) => v + 1),
  };
}

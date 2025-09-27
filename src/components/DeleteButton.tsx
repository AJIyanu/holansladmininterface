"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface DeleteActionButtonProps {
  url: string;
  id: string;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: string) => void;
  confirmMessage?: string;
}

export default function DeleteActionButton({
  url,
  id,
  onDeleteSuccess,
  onDeleteError,
  confirmMessage = "Are you sure you want to delete?",
}: DeleteActionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(orderId: string) {
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`${url}${orderId}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      onDeleteSuccess?.();
      window.location.reload();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      onDeleteError?.(errorMessage);
      window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button onClick={() => handleDelete(id)} disabled={isDeleting} size="sm">
      <Trash2 className="h-4 w-4 text-red-500" />
      {isDeleting && <span className="ml-2">Deleting...</span>}
    </Button>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };
  return (
    <div className="flex items-center gap-2 text-red-500 w-full mb-3">
      <Button onClick={handleLogout} variant="ghost">
        <LogOut className="h-5 w-5" /> Log out
      </Button>
    </div>
  );
}

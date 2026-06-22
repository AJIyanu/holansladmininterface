import { AlertTriangle, MonitorSmartphone } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResponsiveActionGuardProps {
  children: React.ReactNode;
  actionName?: string;
}

export default function ResponsiveActionGuard({
  children,
  actionName = "this action",
}: ResponsiveActionGuardProps) {
  return (
    <>
      <div className="md:hidden">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="size-4 text-[#F46C0B]" />

          <AlertTitle>Tablet or desktop required</AlertTitle>

          <AlertDescription className="mt-2 space-y-3">
            <p>
              For security and accuracy, {actionName} can only be completed on a
              tablet or desktop computer.
            </p>

            <div className="flex items-center gap-2 text-sm font-medium">
              <MonitorSmartphone className="size-4" />
              Please open this page on a larger device.
            </div>
          </AlertDescription>
        </Alert>
      </div>

      <div className="hidden md:block">{children}</div>
    </>
  );
}

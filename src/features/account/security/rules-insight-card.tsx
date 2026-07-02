import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { RulesInsight } from "./types";
import { riskBadgeClass } from "./utils";

interface RulesInsightCardProps {
  insight: RulesInsight;
}

export default function RulesInsightCard({ insight }: RulesInsightCardProps) {
  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-5 text-[#0B4F8A]" />
            System insight
          </CardTitle>
          <Badge
            variant="outline"
            className={riskBadgeClass(insight.risk_level)}
          >
            {insight.risk_level.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-foreground/80">{insight.text}</p>
      </CardContent>
    </Card>
  );
}

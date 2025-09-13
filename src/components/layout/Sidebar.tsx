import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Truck, Scale, ChevronRight } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-white/60 backdrop-blur-sm rounded-md min-h-[calc(100vh-73px)]">
      <Card className="m-4 p-4 border-0 shadow-sm">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Research
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Plan & Reports
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Truck className="h-4 w-4 mr-2" />
            Deliverables
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Scale className="h-4 w-4 mr-2" />
            Legal
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </nav>
      </Card>
    </aside>
  );
}

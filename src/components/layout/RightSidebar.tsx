import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-80 bg-white/80 backdrop-blur-sm fixed right-0 rounded-lg">
      <div className="p-4 space-y-4">
        {/* Approval Requests */}
        <Card className="p-4 border-0 shadow-sm">
          <h3 className="font-semibold mb-3">Approval requests</h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm">Content plan</p>
              <p className="text-xs text-gray-500">12 Jun</p>
            </div>
            <div>
              <p className="font-medium text-sm">Mobile version</p>
              <p className="text-xs text-gray-500">9 Jun</p>
            </div>
            <div>
              <p className="font-medium text-sm">Branding asse...</p>
              <p className="text-xs text-gray-500">7 Jun</p>
            </div>
            <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
              View all
            </Button>
          </div>
        </Card>

        {/* Get Help */}
        <Card className="p-4 border-0 shadow-sm">
          <h3 className="font-semibold mb-2">Get help</h3>
          <p className="text-sm text-gray-600 mb-3">
            Do you have any questions? Our team will gladly help you
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Get help
          </Button>
        </Card>

        {/* Task Management Placeholder */}
        <Card className="p-4 border-0 shadow-sm">
          <h3 className="font-semibold mb-3">Task Management</h3>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </Card>

        {/* Schedule Placeholder */}
        <Card className="p-4 border-0 shadow-sm">
          <h3 className="font-semibold mb-3">Schedule</h3>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
          </div>
        </Card>
      </div>
    </aside>
  );
}

import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  return (
    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 mb-6 bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2">
      <Home className="h-4 w-4" />
      <span>Home</span>
      <ChevronRight className="h-4 w-4" />
      <span>Deliverables</span>
      <ChevronRight className="h-4 w-4" />
      <span className="text-gray-900 font-medium">Files</span>
    </div>
  );
}

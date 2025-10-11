import {
  Home,
  User,
  Settings,
  AlertTriangle,
  BarChart3,
  FileText,
  Truck,
  Scale,
  FolderOpen,
  ImageIcon,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  PieChart,
  Calculator,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckSquare,
  Target,
  Award,
  Briefcase,
  FileSpreadsheet,
  Database,
  Shield,
  Key,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  MessageSquare,
  Star,
  Bookmark,
  Tag,
  Archive,
  Trash2,
  NotebookText,
  ContactRound,
} from "lucide-react";
import { LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  name: string;
}

const iconMap: {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
} = {
  // Navigation & General
  home: Home,
  user: User,
  settings: Settings,
  warning: AlertTriangle,
  chevrondown: ChevronDown,
  chevronright: ChevronRight,
  search: Search,
  filter: Filter,

  // Procurement & Supply Chain
  procurement: ShoppingCart,
  suppliers: Building,
  orders: Package,
  deliverables: Truck,
  inventory: Database,
  track: NotebookText,

  // CRM & Customer Management
  customers: Users,
  contacts: UserCheck,
  leads: Target,
  opportunities: Award,
  communications: MessageSquare,
  phone: Phone,
  email: Mail,
  calendar: Calendar,
  directory: ContactRound,

  // Financial & Accounting
  finance: DollarSign,
  payments: CreditCard,
  invoices: Receipt,
  revenue: TrendingUp,
  expenses: Calculator,
  reports: FileText,
  analytics: PieChart,
  budget: FileSpreadsheet,

  // User Management & Security
  accounts: User,
  roles: Shield,
  permissions: Key,
  adduser: UserPlus,
  removeuser: UserMinus,

  // Documents & Files
  files: FolderOpen,
  documents: FileText,
  assets: ImageIcon,
  archive: Archive,
  upload: Upload,
  download: Download,

  // Projects & Tasks
  projects: Briefcase,
  tasks: CheckSquare,
  schedule: Clock,
  concept: Lightbulb,

  // Research & Legal
  research: BarChart3,
  legal: Scale,

  // Notifications & Communication
  notifications: Bell,
  favorites: Star,
  bookmarks: Bookmark,
  tags: Tag,

  // Actions
  delete: Trash2,
};

// interface IconProps {
//   name: string;
//   [key: string]: any;
// }

const Icon = ({ name, ...props }: IconProps) => {
  const IconComponent = iconMap[name.toLowerCase()] || AlertTriangle;

  return <IconComponent {...props} />;
};

export default Icon;

// Custom icon components that work with any lucide-react version
import { Grid3x3 } from '../../components/common/Icons'
// or use Grid instead
import { Grid } from 'lucide-react'  // Grid is the new name

// Create safe icon components
export const Grid3x3 = (props) => {
  const Icon = LucideIcons.Grid || LucideIcons.LayoutGrid || LucideIcons.Grid3X3
  return Icon ? <Icon {...props} /> : <div {...props}>📊</div>
}

export const Youtube = (props) => {
  const Icon = LucideIcons.PlayCircle || LucideIcons.Youtube
  return Icon ? <Icon {...props} /> : <div {...props}>▶️</div>
}

export const LayoutGrid = (props) => {
  const Icon = LucideIcons.Grid || LucideIcons.LayoutGrid
  return Icon ? <Icon {...props} /> : <div {...props}>⊞</div>
}

// Re-export all other icons safely
export const {
  Globe,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  PlayCircle,
  Heart,
  Home,
  User,
  Settings,
  Bell,
  MessageCircle,
  Plus,
  Minus,
  X,
  Check,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  Download,
  Share2,
  Bookmark,
  Eye,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  LogOut,
  Trash2,
  Pencil,
  Menu,
  ArrowLeft,
  ArrowRight
} = LucideIcons

// Icon mapper to handle lucide-react version differences
import * as LucideIcons from 'lucide-react'

// Map of old icon names to new ones
const iconMappings = {
  // Layout/Grid icons
  'Grid3x3': 'Grid',
  'Grid2x2': 'Grid',
  'Grid3x3X': 'Grid',
  'LayoutGrid': 'Grid',
  'MenuSquare': 'Menu',
  
  // Social media icons
  'Youtube': 'PlayCircle',
  'YouTube': 'PlayCircle',
  
  // Navigation icons
  'ChevronLeftCircle': 'ChevronLeft',
  'ChevronRightCircle': 'ChevronRight',
  'ArrowLeftCircle': 'ArrowLeft',
  'ArrowRightCircle': 'ArrowRight',
  
  // Action icons
  'Trash': 'Trash2',
  'Edit': 'Pencil',
  'Edit2': 'Pencil',
  'Edit3': 'Pencil',
  'Plus': 'Plus',
  'Minus': 'Minus',
  'X': 'X',
  'Check': 'Check',
  
  // Status icons  
  'AlertTriangle': 'AlertTriangle',
  'AlertOctagon': 'AlertOctagon',
  'AlertCircle': 'AlertCircle',
}

// Get the correct icon component
export const getIcon = (iconName) => {
  // Check if icon exists directly
  if (LucideIcons[iconName]) {
    return LucideIcons[iconName]
  }
  
  // Check mapping for alternative name
  const mappedName = iconMappings[iconName]
  if (mappedName && LucideIcons[mappedName]) {
    console.warn(`Icon "${iconName}" not found, using "${mappedName}" instead`)
    return LucideIcons[mappedName]
  }
  
  // Return a fallback icon
  console.error(`Icon "${iconName}" not found in lucide-react`)
  return LucideIcons.HelpCircle || LucideIcons.Circle
}

// Create a proxy to handle all icon imports dynamically
export const Icon = new Proxy({}, {
  get: (target, prop) => {
    return getIcon(prop)
  }
})

// Export common icons directly
export const {
  Grid = LucideIcons.Grid,
  Menu = LucideIcons.Menu,
  PlayCircle = LucideIcons.PlayCircle,
  Facebook = LucideIcons.Facebook,
  Twitter = LucideIcons.Twitter,
  Instagram = LucideIcons.Instagram,
  Linkedin = LucideIcons.Linkedin,
  Globe = LucideIcons.Globe,
  ChevronDown = LucideIcons.ChevronDown,
  ChevronLeft = LucideIcons.ChevronLeft,
  ChevronRight = LucideIcons.ChevronRight,
  ArrowLeft = LucideIcons.ArrowLeft,
  ArrowRight = LucideIcons.ArrowRight,
  Heart = LucideIcons.Heart,
  Home = LucideIcons.Home,
  User = LucideIcons.User,
  Settings = LucideIcons.Settings,
  Bell = LucideIcons.Bell,
  MessageCircle = LucideIcons.MessageCircle,
  Plus = LucideIcons.Plus,
  Minus = LucideIcons.Minus,
  X = LucideIcons.X,
  Check = LucideIcons.Check,
  Search = LucideIcons.Search,
  Filter = LucideIcons.Filter,
  Star = LucideIcons.Star,
  Phone = LucideIcons.Phone,
  Mail = LucideIcons.Mail,
  MapPin = LucideIcons.MapPin,
  Calendar = LucideIcons.Calendar,
  DollarSign = LucideIcons.DollarSign,
  Upload = LucideIcons.Upload,
  Download = LucideIcons.Download,
  Share2 = LucideIcons.Share2,
  Bookmark = LucideIcons.Bookmark,
  Eye = LucideIcons.Eye,
  ThumbsUp = LucideIcons.ThumbsUp,
  AlertCircle = LucideIcons.AlertCircle,
  AlertTriangle = LucideIcons.AlertTriangle,
  CheckCircle = LucideIcons.CheckCircle,
  XCircle = LucideIcons.XCircle,
  Info = LucideIcons.Info,
  HelpCircle = LucideIcons.HelpCircle,
  LogOut = LucideIcons.LogOut,
  Trash2 = LucideIcons.Trash2,
  Pencil = LucideIcons.Pencil,
} = LucideIcons

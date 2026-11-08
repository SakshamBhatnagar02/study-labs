import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  LineChart,
  Calculator,
  Sparkles,
  Flame,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Award,
  Bookmark,
  FlaskConical,
  Atom,
  TrendingUp,
  Target,
  BrainCircuit,
  Sliders,
  Scale,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  FileEdit,
  Layers,
  Search,
  Plus,
  Trash2,
  Share2,
  Info,
  Maximize2,
  Zap,
  Volume2,
  VolumeX,
  Vibrate,
  Activity,
  Check,
  X,
  LucideIcon,
} from 'lucide-react-native';

export type IconName =
  | 'dashboard'
  | 'book'
  | 'curriculum'
  | 'check-square'
  | 'chart'
  | 'calculator'
  | 'sparkles'
  | 'flame'
  | 'sun'
  | 'moon'
  | 'clock'
  | 'check-circle'
  | 'x-circle'
  | 'check'
  | 'x'
  | 'rotate-ccw'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'award'
  | 'trophy'
  | 'bookmark'
  | 'flask'
  | 'atom'
  | 'trending-up'
  | 'target'
  | 'brain'
  | 'sliders'
  | 'scale'
  | 'calendar'
  | 'bell'
  | 'settings'
  | 'help'
  | 'edit'
  | 'layers'
  | 'search'
  | 'plus'
  | 'trash'
  | 'share'
  | 'info'
  | 'zap'
  | 'volume'
  | 'volume-x'
  | 'vibrate'
  | 'activity'
  | 'water'
  | 'notes';

const ICON_MAP: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  book: BookOpen,
  curriculum: BookOpen,
  'check-square': CheckSquare,
  chart: LineChart,
  calculator: Calculator,
  sparkles: Sparkles,
  flame: Flame,
  sun: Sun,
  moon: Moon,
  clock: Clock,
  'check-circle': CheckCircle2,
  'x-circle': XCircle,
  check: Check,
  x: X,
  'rotate-ccw': RotateCcw,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  award: Award,
  trophy: Award,
  bookmark: Bookmark,
  flask: FlaskConical,
  atom: Atom,
  'trending-up': TrendingUp,
  target: Target,
  brain: BrainCircuit,
  sliders: Sliders,
  scale: Scale,
  calendar: Calendar,
  bell: Bell,
  settings: Settings,
  help: HelpCircle,
  edit: FileEdit,
  layers: Layers,
  search: Search,
  plus: Plus,
  trash: Trash2,
  share: Share2,
  info: Info,
  zap: Zap,
  volume: Volume2,
  'volume-x': VolumeX,
  vibrate: Vibrate,
  activity: Activity,
  water: FlaskConical,
  notes: FileEdit,
};

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface AppIconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  color,
  strokeWidth = 2,
  style,
}) => {
  const { colors } = useTheme();

  const getNumericSize = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 14;
      case 'sm':
        return 18;
      case 'md':
        return 22;
      case 'lg':
        return 26;
      case 'xl':
        return 32;
      default:
        return 22;
    }
  };

  const IconComponent = ICON_MAP[name] || Sparkles;
  const iconColor = color || colors.primary;
  const numSize = getNumericSize();

  return (
    <View style={style}>
      <IconComponent size={numSize} color={iconColor} strokeWidth={strokeWidth} />
    </View>
  );
};

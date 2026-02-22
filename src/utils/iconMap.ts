import {
  Target, Shield, Brain, Waves, Octagon, HelpCircle,
  Wind, Frown, CheckCircle, AlertTriangle, AlertCircle,
  Camera, Star, Check, Coffee, Flame, Wine, Wheat, Bean,
  Milk, Leaf, Zap, Smile, ScanLine,
} from 'lucide-react-native';

export const ICON_MAP: Record<string, any> = {
  // Goals
  triggers:   Target,
  bloating:   Wind,
  fear:       Shield,
  understand: Brain,

  // Conditions
  ibs_d:  Waves,
  ibs_c:  Octagon,
  unsure: HelpCircle,

  // Symptoms
  gas:      Wind,
  cramping: Zap,
  nausea:   Frown,

  // Triggers
  dairy:    Milk,
  garlic:   AlertTriangle,
  onion:    AlertCircle,
  gluten:   Wheat,
  caffeine: Coffee,
  spicy:    Flame,
  alcohol:  Wine,
  beans:    Bean,

  // Log States
  sad:     Frown,
  neutral: HelpCircle,
  happy:   Smile,

  // Status
  safe:    CheckCircle,
  caution: AlertTriangle,
  risky:   AlertCircle,

  // Actions
  camera: Camera,
  scan:   ScanLine,
  star:   Star,
  check:  Check,
  leaf:   Leaf,
};

export const getLucideIcon = (key: string) => ICON_MAP[key] || Star;

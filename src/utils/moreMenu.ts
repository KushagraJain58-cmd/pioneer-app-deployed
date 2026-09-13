import { Ionicons } from '@expo/vector-icons';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

export interface MoreItem {
  label: string;
  screen: string;
  // Either a key into APP_ICONS (png line-icon from the web sidebar) or an Ionicon name.
  png?: keyof typeof import('./appIcons').APP_ICONS;
  ion?: IonName;
}

// Everything that isn't one of the first four tabs (Home, Careers, University, Tests).
export const MORE_ITEMS: MoreItem[] = [
  { label: 'Skills', screen: 'Skills', png: 'skill' },
  { label: 'Counselling', screen: 'Counselling', png: 'counselling' },
  { label: 'Resources', screen: 'Resources', ion: 'folder-open-outline' },
  { label: 'Explore City', screen: 'ExploreCity', ion: 'compass-outline' },
  { label: 'Blog', screen: 'Blog', png: 'blog' },
  { label: 'CV Builder', screen: 'CVBuilder', png: 'cv' },
  { label: 'Settings', screen: 'Settings', png: 'settings' },
];

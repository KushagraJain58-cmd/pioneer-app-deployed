import { ImageSourcePropType } from 'react-native';

// PNG line-icons copied from pioneer-client-deploy so the mobile nav matches the web sidebar.
export const APP_ICONS: Record<string, ImageSourcePropType> = {
  dashboard: require('../../assets/icons/dashboard.png'),
  career: require('../../assets/icons/career.png'),
  university: require('../../assets/icons/university.png'),
  psychometric: require('../../assets/icons/psychometric.png'),
  skill: require('../../assets/icons/skill.png'),
  counselling: require('../../assets/icons/counselling.png'),
  blog: require('../../assets/icons/blog.png'),
  cv: require('../../assets/icons/cv.png'),
  settings: require('../../assets/icons/settings.png'),
};

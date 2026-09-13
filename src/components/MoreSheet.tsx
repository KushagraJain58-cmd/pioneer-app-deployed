import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_ICONS } from '../utils/appIcons';
import { MORE_ITEMS, MoreItem } from '../utils/moreMenu';

const COLORS = {
  primary: '#004877',
  accent: '#3BBEE8',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  border: '#E4EDF3',
  surface: '#F0F7FB',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (screen: string) => void;
}

export default function MoreSheet({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  // mounted controls whether the Modal is in the tree so we can play the exit animation.
  const [mounted, setMounted] = React.useState(visible);
  const translateY = useRef(new Animated.Value(500)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: 500,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  const renderIcon = (item: MoreItem) =>
    item.png ? (
      <Image source={APP_ICONS[item.png]} style={styles.pngIcon} resizeMode="contain" />
    ) : (
      <Ionicons name={item.ion!} size={24} color={COLORS.primary} />
    );

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.head}>
            <Text style={styles.title}>More</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {MORE_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.screen}
                activeOpacity={0.85}
                style={styles.tile}
                onPress={() => onSelect(item.screen)}
              >
                <View style={styles.tileIcon}>{renderIcon(item)}</View>
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,27,42,0.45)' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#0A2A3F',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tile: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 14,
  },
  tileIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pngIcon: { width: 26, height: 26, tintColor: COLORS.primary },
  tileLabel: { fontSize: 11.5, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});

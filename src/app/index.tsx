import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, useThemeStore, NightMode } from '../store/themeStore';
import { useJotStore } from '../store/jotStore';
import { glanceService } from '../services/glanceService';

export default function ScratchpadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, isDark } = useTheme();
  const { nightMode, setNightMode } = useThemeStore();

  const activeText = useJotStore((s) => s.activeText);
  const setActiveText = useJotStore((s) => s.setActiveText);
  const isGlanceActive = useJotStore((s) => s.isGlanceActive);
  const toggleGlance = useJotStore((s) => s.toggleGlance);
  const completeActiveJot = useJotStore((s) => s.completeActiveJot);
  const archivedCount = useJotStore((s) => s.archivedJots.length);

  const [menuVisible, setMenuVisible] = useState(false);
  const [glanceFeedback, setGlanceFeedback] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const hasText = activeText.trim().length > 0;

  // Dynamic typography scale: large for short thoughts, gracefully scaling for longer jots
  const fontSize = useMemo(() => {
    const len = activeText.length;
    if (len < 50) return 24;
    if (len < 120) return 20;
    if (len < 220) return 18;
    return 16;
  }, [activeText]);

  const handleDone = async () => {
    if (!hasText) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeActiveJot();
  };

  const handleClear = () => {
    if (!hasText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveText('');
    setMenuVisible(false);
  };

  const handleGlancePress = async () => {
    Haptics.selectionAsync();
    const willBeActive = !isGlanceActive;
    if (willBeActive) {
      const hasPerm = await glanceService.ensurePermissions();
      if (!hasPerm) {
        setGlanceFeedback('Permission required');
        setTimeout(() => setGlanceFeedback(null), 2000);
        return;
      }
    }
    await toggleGlance();
    setGlanceFeedback(willBeActive ? 'Live on Lock Screen' : 'Lock Screen Paused');
    setTimeout(() => {
      setGlanceFeedback(null);
    }, 1800);
  };

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.bg,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 12),
          paddingHorizontal: 20,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 44,
          marginBottom: 12,
        },
        headerSpacer: {
          width: 36,
          height: 36,
        },
        headerTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.inkMid,
          letterSpacing: -0.3,
        },
        dotsBtn: {
          width: 36,
          height: 36,
          borderRadius: 18,
          borderCurve: 'continuous',
          backgroundColor: colors.bgRaised,
          borderWidth: 1,
          borderColor: colors.strokeDim,
          justifyContent: 'center',
          alignItems: 'center',
        },
        dotsSvg: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        },
        dotItem: {
          width: 3.5,
          height: 3.5,
          borderRadius: 1.75,
          backgroundColor: colors.ink,
        },
        canvasCard: {
          flex: 1,
          backgroundColor: colors.bgRaised,
          borderRadius: 24,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.strokeDim,
          padding: 22,
          marginBottom: 12,
          overflow: 'hidden',
        },
        textInput: {
          flex: 1,
          color: colors.ink,
          lineHeight: fontSize * 1.45,
          textAlignVertical: 'top',
        },
        cardFooter: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: 8,
          gap: 8,
        },
        glanceFeedbackText: {
          fontSize: 11,
          fontWeight: '500',
          color: colors.inkDim,
          letterSpacing: -0.1,
        },
        statusRingBtn: {
          width: 28,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
        },
        doneContainer: {
          paddingBottom: Platform.OS === 'android' ? 4 : 0,
        },
        donePill: {
          height: 52,
          borderRadius: 26,
          borderCurve: 'continuous',
          backgroundColor: colors.doneBtn,
          justifyContent: 'center',
          alignItems: 'center',
        },
        donePillDisabled: {
          opacity: 0.35,
        },
        donePillPressed: {
          opacity: 0.88,
          transform: [{ scale: 0.985 }],
        },
        donePillText: {
          color: colors.doneBtnText,
          fontSize: 16,
          fontWeight: '600',
          letterSpacing: -0.2,
        },
        // Minimalist Bottom Sheet / Options Modal
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        sheetContent: {
          backgroundColor: colors.bgRaised,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderCurve: 'continuous',
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingHorizontal: 22,
          borderWidth: 1,
          borderColor: colors.strokeDim,
        },
        handleBar: {
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.strokeDim,
          alignSelf: 'center',
          marginBottom: 18,
        },
        sheetTitle: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.inkDim,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 16,
        },
        menuRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.strokeDim,
        },
        menuLabel: {
          fontSize: 16,
          fontWeight: '500',
          color: colors.ink,
        },
        menuSublabel: {
          fontSize: 12,
          color: colors.inkDim,
          marginTop: 2,
        },
        badge: {
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 12,
          backgroundColor: colors.bgDeep,
        },
        badgeText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.inkMid,
          fontVariant: ['tabular-nums'],
        },
        themeSegment: {
          flexDirection: 'row',
          backgroundColor: colors.bgDeep,
          borderRadius: 10,
          padding: 3,
        },
        segmentBtn: {
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
        },
        segmentBtnActive: {
          backgroundColor: colors.bgRaised,
          borderWidth: 1,
          borderColor: colors.strokeDim,
        },
        segmentText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.inkDim,
        },
        segmentTextActive: {
          color: colors.ink,
        },
        clearText: {
          fontSize: 15,
          fontWeight: '500',
          color: colors.inkDim,
        },
      }),
    [colors, insets, radius, fontSize]
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 1. Header: Mononote centered title & single subtle ••• button */}
      <View style={s.header}>
        <View style={s.headerSpacer} />
        <Text style={s.headerTitle}>MonoJot</Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setMenuVisible(true);
          }}
          style={s.dotsBtn}
          accessibilityLabel="Options"
          hitSlop={8}
        >
          <View style={s.dotsSvg}>
            <View style={s.dotItem} />
            <View style={s.dotItem} />
            <View style={s.dotItem} />
          </View>
        </Pressable>
      </View>

      {/* 2. Primary Inset Canvas Card */}
      <View style={s.canvasCard}>
        <TextInput
          ref={inputRef}
          style={[s.textInput, { fontSize }]}
          value={activeText}
          onChangeText={setActiveText}
          placeholder="Note..."
          placeholderTextColor={colors.inkDim}
          multiline
          autoFocus
          selectionColor={colors.ink}
        />
        <View style={s.cardFooter}>
          {glanceFeedback && (
            <Text style={s.glanceFeedbackText}>{glanceFeedback}</Text>
          )}
          <Pressable
            onPress={handleGlancePress}
            hitSlop={12}
            accessibilityLabel={
              isGlanceActive
                ? 'Lock Screen Glance is Active (tap to pause)'
                : 'Lock Screen Glance is Paused (tap to activate)'
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              s.statusRingBtn,
              pressed && { opacity: 0.5, transform: [{ scale: 0.92 }] },
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <Circle
                cx={8}
                cy={8}
                r={6.5}
                stroke={isGlanceActive ? colors.ink : colors.strokeDim}
                strokeWidth={1.4}
                strokeDasharray={isGlanceActive ? undefined : '2.5, 2'}
              />
              {isGlanceActive && (
                <Circle cx={8} cy={8} r={3} fill={colors.ink} />
              )}
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* 3. The Signature "Done" Pill — Always docked above keyboard */}
      <View style={s.doneContainer}>
        <Pressable
          onPress={handleDone}
          disabled={!hasText}
          style={({ pressed }) => [
            s.donePill,
            !hasText && s.donePillDisabled,
            pressed && hasText && s.donePillPressed,
          ]}
        >
          <Text style={s.donePillText}>Done</Text>
        </Pressable>
      </View>

      {/* 4. Minimalist Options Bottom Sheet Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.sheetContent}>
                <View style={s.handleBar} />
                <Text style={s.sheetTitle}>Options</Text>

                {/* Archive Item */}
                <Pressable
                  style={s.menuRow}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/history');
                  }}
                >
                  <View>
                    <Text style={s.menuLabel}>Archive</Text>
                    <Text style={s.menuSublabel}>Completed jots & notes</Text>
                  </View>
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{archivedCount}</Text>
                  </View>
                </Pressable>

                {/* Lock Screen Glance Switch */}
                <View style={s.menuRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={s.menuLabel}>Lock Screen Glance</Text>
                    <Text style={s.menuSublabel}>Mirror active note to lock screen</Text>
                  </View>
                  <Switch
                    value={isGlanceActive}
                    onValueChange={async () => {
                      Haptics.selectionAsync();
                      if (!isGlanceActive) {
                        await glanceService.ensurePermissions();
                      }
                      toggleGlance();
                    }}
                    trackColor={{ false: colors.strokeDim, true: colors.ink }}
                    thumbColor={isDark ? colors.bg : colors.bgRaised}
                  />
                </View>

                {/* Appearance Theme Selector */}
                <View style={s.menuRow}>
                  <Text style={s.menuLabel}>Theme</Text>
                  <View style={s.themeSegment}>
                    {(['system', 'light', 'dark'] as NightMode[]).map((mode) => (
                      <Pressable
                        key={mode}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setNightMode(mode);
                        }}
                        style={[
                          s.segmentBtn,
                          nightMode === mode && s.segmentBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            s.segmentText,
                            nightMode === mode && s.segmentTextActive,
                          ]}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Clear Current Note */}
                {hasText && (
                  <Pressable style={[s.menuRow, { borderBottomWidth: 0 }]} onPress={handleClear}>
                    <Text style={s.clearText}>Clear Note</Text>
                  </Pressable>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

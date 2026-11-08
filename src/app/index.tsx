import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../store/themeStore';
import { useJotStore } from '../store/jotStore';

export default function ScratchpadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, shadow } = useTheme();

  const activeText = useJotStore((s) => s.activeText);
  const setActiveText = useJotStore((s) => s.setActiveText);
  const isGlanceActive = useJotStore((s) => s.isGlanceActive);
  const toggleGlance = useJotStore((s) => s.toggleGlance);
  const completeActiveJot = useJotStore((s) => s.completeActiveJot);
  const archivedCount = useJotStore((s) => s.archivedJots.length);

  const inputRef = useRef<TextInput>(null);

  // Dynamic typography scale: large for short thoughts, scales down gracefully as text grows
  const fontSize = useMemo(() => {
    const len = activeText.length;
    if (len < 40) return 26;
    if (len < 100) return 22;
    if (len < 200) return 19;
    return 17;
  }, [activeText]);

  const handleDone = async () => {
    if (!activeText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeActiveJot();
  };

  const handleGlanceToggle = () => {
    Haptics.selectionAsync();
    toggleGlance();
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
          height: 48,
          marginBottom: 16,
        },
        brandTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.ink,
          letterSpacing: -0.4,
        },
        headerActions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        circleBtn: {
          width: 38,
          height: 38,
          borderRadius: 19,
          borderCurve: 'continuous',
          backgroundColor: colors.bgRaised,
          borderWidth: 1,
          borderColor: colors.strokeDim,
          justifyContent: 'center',
          alignItems: 'center',
        },
        circleBtnActive: {
          borderColor: colors.stroke,
          backgroundColor: colors.bgRaised,
        },
        actionIconText: {
          fontSize: 16,
        },
        canvasCard: {
          flex: 1,
          backgroundColor: colors.bgRaised,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.strokeDim,
          padding: 22,
          ...shadow.gentle,
        },
        textInput: {
          flex: 1,
          color: colors.ink,
          lineHeight: fontSize * 1.45,
          textAlignVertical: 'top',
        },
        doneContainer: {
          paddingTop: 14,
        },
        donePill: {
          height: 52,
          borderRadius: radius.pill,
          borderCurve: 'continuous',
          backgroundColor: colors.doneBtn,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadow.donePill,
        },
        donePillText: {
          color: colors.doneBtnText,
          fontSize: 16,
          fontWeight: '700',
          letterSpacing: -0.2,
        },
      }),
    [colors, insets, radius, shadow, fontSize]
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.brandTitle}>MonoJot</Text>

        <View style={s.headerActions}>
          {/* Lock Screen Glance Indicator */}
          <Pressable
            onPress={handleGlanceToggle}
            style={[s.circleBtn, isGlanceActive && s.circleBtnActive]}
            accessibilityLabel="Toggle Lock Screen Glance"
          >
            <Text style={s.actionIconText}>{isGlanceActive ? '📌' : '🔕'}</Text>
          </Pressable>

          {/* Archive / History */}
          <Pressable
            onPress={() => router.push('/history')}
            style={s.circleBtn}
            accessibilityLabel={`Archived Notes (${archivedCount})`}
          >
            <Text style={s.actionIconText}>•••</Text>
          </Pressable>
        </View>
      </View>

      {/* Primary Inset Canvas Card */}
      <View style={s.canvasCard}>
        <TextInput
          ref={inputRef}
          style={[s.textInput, { fontSize }]}
          value={activeText}
          onChangeText={setActiveText}
          placeholder="What's on your mind right now?"
          placeholderTextColor={colors.inkDim}
          multiline
          autoFocus
          selectionColor={colors.ink}
        />
      </View>

      {/* The Signature "Done" Pill */}
      {activeText.trim().length > 0 && (
        <View style={s.doneContainer}>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [
              s.donePill,
              pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
            ]}
          >
            <Text style={s.donePillText}>Done</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

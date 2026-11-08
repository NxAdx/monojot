import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Line } from 'react-native-svg';
import { useTheme } from '../store/themeStore';
import { useJotStore, ArchivedJot } from '../store/jotStore';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, shadow } = useTheme();

  const archivedJots = useJotStore((s) => s.archivedJots);
  const restoreJot = useJotStore((s) => s.restoreJot);
  const deleteArchivedJot = useJotStore((s) => s.deleteArchivedJot);

  const handleRestore = (jot: ArchivedJot) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    restoreJot(jot);
    router.back();
  };

  const handleDelete = (id: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteArchivedJot(id);
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
          marginBottom: 16,
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
        closeBtn: {
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
        card: {
          backgroundColor: colors.bgRaised,
          borderRadius: 18,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.strokeDim,
          padding: 18,
          marginBottom: 12,
          ...shadow.gentle,
        },
        cardContent: {
          marginBottom: 12,
        },
        cardText: {
          fontSize: 16,
          color: colors.ink,
          lineHeight: 23,
          fontWeight: '400',
        },
        cardFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        timestamp: {
          fontSize: 12,
          color: colors.inkDim,
          fontVariant: ['tabular-nums'],
        },
        restoreHint: {
          fontSize: 11,
          color: colors.inkDim,
          marginTop: 2,
        },
        deleteBtn: {
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bgDeep,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 40,
        },
        emptyTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.inkMid,
          marginBottom: 4,
        },
        emptySub: {
          fontSize: 13,
          color: colors.inkDim,
        },
      }),
    [colors, insets, radius, shadow]
  );

  return (
    <View style={s.container}>
      {/* 1. Header: Mononote centered title with tabular count & minimal close button */}
      <View style={s.header}>
        <View style={s.headerSpacer} />
        <Text style={s.headerTitle}>
          Archive {archivedJots.length > 0 ? `(${archivedJots.length})` : ''}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={s.closeBtn}
          accessibilityLabel="Close Archive"
          hitSlop={8}
        >
          <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <Line
              x1="2"
              y1="2"
              x2="12"
              y2="12"
              stroke={colors.ink}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <Line
              x1="12"
              y1="2"
              x2="2"
              y2="12"
              stroke={colors.ink}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* 2. Archived Notes List */}
      {archivedJots.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyTitle}>No completed jots</Text>
          <Text style={s.emptySub}>Tap Done on any note to archive it here.</Text>
        </View>
      ) : (
        <FlashList
          data={archivedJots}
          estimatedItemSize={92}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                s.card,
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
              ]}
              onPress={() => handleRestore(item)}
              accessibilityLabel={`Tap to restore: ${item.text}`}
            >
              <View style={s.cardContent}>
                <Text style={s.cardText} numberOfLines={5}>
                  {item.text}
                </Text>
              </View>

              <View style={s.cardFooter}>
                <View>
                  <Text style={s.timestamp}>
                    {new Date(item.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={s.restoreHint}>Tap card to restore</Text>
                </View>

                {/* Minimal delete icon button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  style={s.deleteBtn}
                  accessibilityLabel="Delete archived note"
                  hitSlop={6}
                >
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                      stroke={colors.inkDim}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

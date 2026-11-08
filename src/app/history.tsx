import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../store/themeStore';
import { useJotStore, ArchivedJot } from '../store/jotStore';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();

  const archivedJots = useJotStore((s) => s.archivedJots);
  const restoreJot = useJotStore((s) => s.restoreJot);
  const deleteArchivedJot = useJotStore((s) => s.deleteArchivedJot);

  const handleRestore = (jot: ArchivedJot) => {
    Haptics.selectionAsync();
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
          height: 48,
          marginBottom: 16,
        },
        title: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.ink,
        },
        closeBtn: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: radius.pill,
          backgroundColor: colors.bgRaised,
          borderWidth: 1,
          borderColor: colors.strokeDim,
        },
        closeText: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.ink,
        },
        card: {
          backgroundColor: colors.bgRaised,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.strokeDim,
          padding: 16,
          marginBottom: 12,
        },
        cardText: {
          fontSize: 15,
          color: colors.ink,
          lineHeight: 22,
          marginBottom: 10,
        },
        cardFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        timestamp: {
          fontSize: 11,
          color: colors.inkDim,
        },
        actions: {
          flexDirection: 'row',
          gap: 12,
        },
        actionLink: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.inkMid,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        emptyText: {
          fontSize: 14,
          color: colors.inkDim,
        },
      }),
    [colors, insets, radius]
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Archive ({archivedJots.length})</Text>
        <Pressable onPress={() => router.back()} style={s.closeBtn}>
          <Text style={s.closeText}>Close</Text>
        </Pressable>
      </View>

      {/* List */}
      {archivedJots.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No completed jots yet</Text>
        </View>
      ) : (
        <FlashList
          data={archivedJots}
          estimatedItemSize={80}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.cardText} numberOfLines={4}>
                {item.text}
              </Text>
              <View style={s.cardFooter}>
                <Text style={s.timestamp}>
                  {new Date(item.completed_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <View style={s.actions}>
                  <Pressable onPress={() => handleRestore(item)}>
                    <Text style={s.actionLink}>Restore</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <Text style={[s.actionLink, { color: '#E53935' }]}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

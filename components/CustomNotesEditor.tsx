import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Platform } from 'react-native';
import { Plus, Trash2, Eye, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AdminNote } from '@/types';

interface Props {
  notes: AdminNote[];
  authorName?: string;
  onChange: (next: AdminNote[]) => void;
  maxNotes?: number;
}

const MAX_DEFAULT = 2;

function newNote(authorName?: string): AdminNote {
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    isPublic: false,
    authorName,
    createdAt: new Date().toISOString(),
  };
}

export const CustomNotesEditor: React.FC<Props> = ({ notes, authorName, onChange, maxNotes = MAX_DEFAULT }) => {
  const handleAdd = useCallback(() => {
    if (notes.length >= maxNotes) return;
    onChange([...notes, newNote(authorName)]);
  }, [notes, maxNotes, authorName, onChange]);

  const updateAt = useCallback((idx: number, patch: Partial<AdminNote>) => {
    onChange(notes.map((n, i) => i === idx ? { ...n, ...patch } : n));
  }, [notes, onChange]);

  const removeAt = useCallback((idx: number) => {
    onChange(notes.filter((_, i) => i !== idx));
  }, [notes, onChange]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>PERSONAL NOTES</Text>
        <Text style={styles.count}>{notes.length}/{maxNotes}</Text>
      </View>
      <Text style={styles.sub}>
        Add custom instructions or reminders. Public notes appear in user-facing recommendations; private notes are visible only to signed-in admins.
      </Text>

      {notes.map((n, idx) => {
        const isPublic = n.isPublic;
        return (
          <View key={n.id} style={[styles.noteCard, isPublic ? styles.notePublic : styles.notePrivate]}>
            <View style={styles.noteHeader}>
              <View style={styles.badgeRow}>
                {isPublic ? (
                  <Eye size={12} color={Colors.success} />
                ) : (
                  <Lock size={12} color={Colors.textTertiary} />
                )}
                <Text style={[styles.badgeText, isPublic ? styles.badgePublic : styles.badgePrivate]}>
                  {isPublic ? 'PUBLIC' : 'PRIVATE'}
                </Text>
                {n.authorName ? (
                  <Text style={styles.author} numberOfLines={1}>· {n.authorName}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => removeAt(idx)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID={`note-delete-${idx}`}
              >
                <Trash2 size={15} color={Colors.redBright} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={n.text}
              onChangeText={v => updateAt(idx, { text: v })}
              multiline
              numberOfLines={3}
              placeholder="Type a note for other admins or users..."
              placeholderTextColor={Colors.textTertiary}
              testID={`note-input-${idx}`}
            />

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Visible to all users</Text>
              <Switch
                value={isPublic}
                onValueChange={v => updateAt(idx, { isPublic: v })}
                trackColor={{ false: Colors.border, true: Colors.success }}
                thumbColor={Platform.OS === 'android' ? Colors.text : undefined}
                testID={`note-public-${idx}`}
              />
            </View>
          </View>
        );
      })}

      {notes.length < maxNotes && (
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.7} testID="note-add">
          <Plus size={15} color={Colors.red} />
          <Text style={styles.addBtnText}>Add Personal Note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
  },
  count: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  sub: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    lineHeight: 15,
    marginBottom: 4,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  notePublic: {
    borderColor: Colors.success + '50',
  },
  notePrivate: {
    borderColor: Colors.border,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  badgePublic: {
    color: Colors.success,
  },
  badgePrivate: {
    color: Colors.textTertiary,
  },
  author: {
    fontSize: 11,
    color: Colors.textTertiary,
    flexShrink: 1,
  },
  input: {
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.red + '70',
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.red,
  },
});

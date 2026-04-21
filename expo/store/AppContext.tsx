import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PRESETS } from '@/mocks/presets';
import { DEFAULT_TIPS } from '@/mocks/tips';
import { DEFAULT_ISSUES } from '@/mocks/issues';
import { SettingPreset, QuickTip, QuickIssue, SavedSetup } from '@/types';
import {
  fetchRemotePresets,
  fetchRemoteTips,
  fetchRemoteIssues,
  saveRemotePresets,
  saveRemoteTips,
  saveRemoteIssues,
} from '@/services/supabase';

const CACHE_PRESETS_KEY = 'cached_setting_presets';
const CACHE_TIPS_KEY = 'cached_quick_tips';
const CACHE_ISSUES_KEY = 'cached_quick_issues';
const SETUPS_KEY = 'saved_setups';

function mergePresets(defaults: SettingPreset[], remote: SettingPreset[]): SettingPreset[] {
  return defaults.map(def => {
    const override = remote.find(r => r.id === def.id);
    return override ?? def;
  });
}

export const [AppProvider, useApp] = createContextHook(() => {
  const [settingPresets, setSettingPresets] = useState<SettingPreset[]>(DEFAULT_PRESETS);
  const [quickTips, setQuickTips] = useState<QuickTip[]>(DEFAULT_TIPS);
  const [quickIssues, setQuickIssues] = useState<QuickIssue[]>(DEFAULT_ISSUES);
  const [savedSetups, setSavedSetups] = useState<SavedSetup[]>([]);

  useEffect(() => {
    void loadCachedData();
  }, []);

  const loadCachedData = async () => {
    console.log('[AppContext] Loading cached data');
    try {
      const [cachedPresets, cachedTips, cachedIssues, cachedSetups] = await Promise.all([
        AsyncStorage.getItem(CACHE_PRESETS_KEY),
        AsyncStorage.getItem(CACHE_TIPS_KEY),
        AsyncStorage.getItem(CACHE_ISSUES_KEY),
        AsyncStorage.getItem(SETUPS_KEY),
      ]);

      if (cachedPresets) {
        const parsed = JSON.parse(cachedPresets) as SettingPreset[];
        setSettingPresets(mergePresets(DEFAULT_PRESETS, parsed));
      }
      if (cachedTips) {
        const parsed = JSON.parse(cachedTips) as QuickTip[];
        if (parsed.length > 0) setQuickTips(parsed);
      }
      if (cachedIssues) {
        const parsed = JSON.parse(cachedIssues) as QuickIssue[];
        if (parsed.length > 0) setQuickIssues(parsed);
      }
      if (cachedSetups) {
        setSavedSetups(JSON.parse(cachedSetups) as SavedSetup[]);
      }
    } catch (e) {
      console.warn('[AppContext] Cache load error:', e);
    }

    void fetchAll();
  };

  const fetchAll = useCallback(async () => {
    console.log('[AppContext] Fetching remote data');
    const [remotePresets, remoteTips, remoteIssues] = await Promise.all([
      fetchRemotePresets(),
      fetchRemoteTips(),
      fetchRemoteIssues(),
    ]);

    if (remotePresets && remotePresets.length > 0) {
      const merged = mergePresets(DEFAULT_PRESETS, remotePresets);
      setSettingPresets(merged);
      await AsyncStorage.setItem(CACHE_PRESETS_KEY, JSON.stringify(remotePresets));
    }
    if (remoteTips && remoteTips.length > 0) {
      setQuickTips(remoteTips);
      await AsyncStorage.setItem(CACHE_TIPS_KEY, JSON.stringify(remoteTips));
    }
    if (remoteIssues && remoteIssues.length > 0) {
      setQuickIssues(remoteIssues);
      await AsyncStorage.setItem(CACHE_ISSUES_KEY, JSON.stringify(remoteIssues));
    }
  }, []);

  const savePresets = useCallback(async (presets: SettingPreset[]) => {
    setSettingPresets(presets);
    await AsyncStorage.setItem(CACHE_PRESETS_KEY, JSON.stringify(presets));
    await saveRemotePresets(presets);
  }, []);

  const saveTips = useCallback(async (tips: QuickTip[]) => {
    setQuickTips(tips);
    await AsyncStorage.setItem(CACHE_TIPS_KEY, JSON.stringify(tips));
    await saveRemoteTips(tips);
  }, []);

  const saveIssues = useCallback(async (issues: QuickIssue[]) => {
    setQuickIssues(issues);
    await AsyncStorage.setItem(CACHE_ISSUES_KEY, JSON.stringify(issues));
    await saveRemoteIssues(issues);
  }, []);

  const persistSetups = async (setups: SavedSetup[]) => {
    await AsyncStorage.setItem(SETUPS_KEY, JSON.stringify(setups));
  };

  const addSavedSetup = useCallback(async (setup: SavedSetup) => {
    const updated = [setup, ...savedSetups];
    setSavedSetups(updated);
    await persistSetups(updated);
  }, [savedSetups]);

  const deleteSavedSetup = useCallback(async (id: string) => {
    const updated = savedSetups.filter(s => s.id !== id);
    setSavedSetups(updated);
    await persistSetups(updated);
  }, [savedSetups]);

  const updateSavedSetup = useCallback(async (id: string, updates: Partial<SavedSetup>) => {
    const updated = savedSetups.map(s => s.id === id ? { ...s, ...updates } : s);
    setSavedSetups(updated);
    await persistSetups(updated);
  }, [savedSetups]);

  return {
    settingPresets,
    quickTips,
    quickIssues,
    savedSetups,
    savePresets,
    saveTips,
    saveIssues,
    addSavedSetup,
    deleteSavedSetup,
    updateSavedSetup,
    fetchAll,
  };
});

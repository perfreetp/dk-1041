import { create } from 'zustand';
import { SystemProfile, RiskItem, ComparisonResult, CollectionStatus } from '../types';
import { mockSystemProfile, isRunningInBrowser } from '../data/mockData';
import { analyzeRisks } from '../services/analyzer';
import { compareProfiles } from '../services/comparator';

interface AppStore {
  profile: SystemProfile | null;
  isLoading: boolean;
  lastUpdate: string | null;
  isUnsupportedEnvironment: boolean;
  collectionStatus: CollectionStatus;
  collectionProgress: number;
  risks: RiskItem[];
  currentProfile: SystemProfile | null;
  historicalProfile: SystemProfile | null;
  comparisonResult: ComparisonResult | null;
  reportNotes: string;
  maintenanceSuggestions: string[];

  loadProfile: () => Promise<void>;
  collectSoftware: () => Promise<void>;
  collectStartupItems: () => Promise<void>;
  collectPeripherals: () => Promise<void>;
  collectShares: () => Promise<void>;
  collectUsers: () => Promise<void>;
  collectLoginRecords: () => Promise<void>;
  collectAll: () => Promise<void>;
  setReportNotes: (notes: string) => void;
  loadHistoricalProfile: (profile: SystemProfile) => void;
  clearHistoricalProfile: () => void;
  generateSuggestions: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  profile: null,
  isLoading: false,
  lastUpdate: null,
  isUnsupportedEnvironment: false,
  collectionStatus: {
    software: 'idle',
    startupItems: 'idle',
    peripherals: 'idle',
    shares: 'idle',
    users: 'idle',
    loginRecords: 'idle'
  },
  collectionProgress: 0,
  risks: [],
  currentProfile: null,
  historicalProfile: null,
  comparisonResult: null,
  reportNotes: '',
  maintenanceSuggestions: [],

  loadProfile: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));

    const isUnsupported = isRunningInBrowser();
    const profile = { ...mockSystemProfile, isDemo: true };

    set({
      profile,
      currentProfile: profile,
      isLoading: false,
      lastUpdate: new Date().toLocaleString('zh-CN'),
      risks: analyzeRisks(profile),
      isUnsupportedEnvironment: isUnsupported
    });
    get().generateSuggestions();
  },

  collectSoftware: async () => {
    if (isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, software: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, software: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        software: mockSystemProfile.software,
        profileTime: new Date().toISOString()
      } : null,
      collectionStatus: { ...state.collectionStatus, software: 'completed' }
    }));
  },

  collectStartupItems: async () => {
    if (!isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, startupItems: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, startupItems: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 1200));
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        startupItems: mockSystemProfile.startupItems,
        profileTime: new Date().toISOString()
      } : null,
      collectionStatus: { ...state.collectionStatus, startupItems: 'completed' }
    }));
  },

  collectPeripherals: async () => {
    if (isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, peripherals: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, peripherals: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        peripherals: mockSystemProfile.peripherals,
        profileTime: new Date().toISOString()
      } : null,
      collectionStatus: { ...state.collectionStatus, peripherals: 'completed' }
    }));
  },

  collectShares: async () => {
    if (!isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, shares: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, shares: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 800));
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        shares: mockSystemProfile.shares,
        profileTime: new Date().toISOString()
      } : null,
      collectionStatus: { ...state.collectionStatus, shares: 'completed' }
    }));
  },

  collectUsers: async () => {
    if (isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, users: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, users: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        users: mockSystemProfile.users,
        profileTime: new Date().toISOString()
      } : null,
      collectionStatus: { ...state.collectionStatus, users: 'completed' }
    }));
  },

  collectLoginRecords: async () => {
    if (!isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, loginRecords: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, loginRecords: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 900));
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        loginRecords: mockSystemProfile.loginRecords,
        profileTime: new Date().toISOString()
      } : null,
      collectionStatus: { ...state.collectionStatus, loginRecords: 'completed' }
    }));
  },

  collectAll: async () => {
    const { collectSoftware, collectStartupItems, collectPeripherals, collectShares, collectUsers, collectLoginRecords } = get();
    set({
      collectionStatus: {
        software: 'idle',
        startupItems: 'idle',
        peripherals: 'idle',
        shares: 'idle',
        users: 'idle',
        loginRecords: 'idle'
      },
      collectionProgress: 0
    });

    await collectSoftware();
    set({ collectionProgress: 16 });
    await collectStartupItems();
    set({ collectionProgress: 33 });
    await collectPeripherals();
    set({ collectionProgress: 50 });
    await collectShares();
    set({ collectionProgress: 66 });
    await collectUsers();
    set({ collectionProgress: 83 });
    await collectLoginRecords();
    set({ collectionProgress: 100 });

    const profile = get().profile;
    if (profile) {
      set({
        risks: analyzeRisks(profile),
        lastUpdate: new Date().toLocaleString('zh-CN')
      });
      get().generateSuggestions();
    }
  },

  setReportNotes: (notes: string) => {
    set({ reportNotes: notes });
  },

  loadHistoricalProfile: (profile: SystemProfile) => {
    const currentProfile = get().currentProfile || get().profile;
    if (currentProfile) {
      const result = compareProfiles(profile, currentProfile);
      set({
        historicalProfile: profile,
        comparisonResult: result
      });
    }
  },

  clearHistoricalProfile: () => {
    set({
      historicalProfile: null,
      comparisonResult: null
    });
  },

  generateSuggestions: () => {
    const { risks } = get();
    const suggestions: string[] = [];

    if (risks.some(r => r.type === 'disk-space' && r.severity === 'high')) {
      suggestions.push('建议清理磁盘空间，删除临时文件和不必要的应用程序');
    }
    if (risks.some(r => r.type === 'startup')) {
      suggestions.push('检查并禁用可疑的启动项，提升系统启动速度');
    }
    if (risks.some(r => r.type === 'outdated-software')) {
      suggestions.push('更新长期未更新的软件，确保安全补丁最新');
    }
    if (risks.some(r => r.type === 'open-share')) {
      suggestions.push('审查共享文件夹权限，关闭非必要的网络共享');
    }
    if (suggestions.length === 0) {
      suggestions.push('系统状态良好，建议保持定期维护习惯');
    }

    set({ maintenanceSuggestions: suggestions });
  }
}));

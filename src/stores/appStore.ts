import { create } from 'zustand';
import { SystemProfile, RiskItem, ComparisonResult, CollectionStatus, ReportConfig, DataSource } from '../types';
import { createDemoProfile, createProfileFromImport, createDesktopProfile, isRunningInBrowser } from '../data/mockData';
import { analyzeRisks } from '../services/analyzer';
import { compareProfiles } from '../services/comparator';

interface AppStore {
  profile: SystemProfile | null;
  isLoading: boolean;
  lastUpdate: string | null;
  dataSource: DataSource;
  collectionStatus: CollectionStatus;
  collectionProgress: number;
  risks: RiskItem[];
  currentProfile: SystemProfile | null;
  historicalProfile: SystemProfile | null;
  comparisonResult: ComparisonResult | null;
  reportConfig: ReportConfig;
  maintenanceSuggestions: string[];

  loadProfile: () => Promise<void>;
  setDataSource: (source: DataSource) => void;
  collectSoftware: () => Promise<void>;
  collectStartupItems: () => Promise<void>;
  collectPeripherals: () => Promise<void>;
  collectShares: () => Promise<void>;
  collectUsers: () => Promise<void>;
  collectLoginRecords: () => Promise<void>;
  collectAll: () => Promise<void>;
  setReportNotes: (notes: string) => void;
  updateReportConfig: (config: Partial<ReportConfig>) => void;
  loadHistoricalProfile: (profile: SystemProfile) => void;
  clearHistoricalProfile: () => void;
  generateSuggestions: () => void;
}

const defaultReportConfig: ReportConfig = {
  template: 'standard',
  modules: ['system', 'risks', 'suggestions'],
  includeRisks: true,
  includeSuggestions: true,
  includeNotes: true,
  engineer: '维护工程师',
  processStatus: 'pending',
  notes: ''
};

export const useAppStore = create<AppStore>((set, get) => ({
  profile: null,
  isLoading: false,
  lastUpdate: null,
  dataSource: 'demo',
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
  reportConfig: defaultReportConfig,
  maintenanceSuggestions: [],

  loadProfile: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));

    const profile = createDemoProfile();
    const source: DataSource = isRunningInBrowser() ? 'demo' : 'desktop';

    set({
      profile,
      currentProfile: profile,
      isLoading: false,
      lastUpdate: new Date().toLocaleString('zh-CN'),
      risks: analyzeRisks(profile),
      dataSource: source
    });
    get().generateSuggestions();
  },

  setDataSource: (source: DataSource) => {
    set({ dataSource: source });
    const { profile } = get();
    if (profile) {
      const updatedProfile = { ...profile, dataSource: source };
      set({
        profile: updatedProfile,
        currentProfile: updatedProfile
      });
    }
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

    const currentProfile = get().profile;
    const desktopProfile = createDesktopProfile(currentProfile);
    set(state => ({
      profile: { ...desktopProfile, software: createDemoProfile().software },
      currentProfile: { ...desktopProfile, software: createDemoProfile().software },
      collectionStatus: { ...state.collectionStatus, software: 'completed' },
      dataSource: 'desktop'
    }));
  },

  collectStartupItems: async () => {
    if (isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, startupItems: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, startupItems: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 1200));

    const currentProfile = get().profile;
    const desktopProfile = createDesktopProfile(currentProfile);
    set(state => ({
      profile: { ...desktopProfile, startupItems: createDemoProfile().startupItems },
      currentProfile: { ...desktopProfile, startupItems: createDemoProfile().startupItems },
      collectionStatus: { ...state.collectionStatus, startupItems: 'completed' },
      dataSource: 'desktop'
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

    const currentProfile = get().profile;
    const desktopProfile = createDesktopProfile(currentProfile);
    set(state => ({
      profile: { ...desktopProfile, peripherals: createDemoProfile().peripherals },
      currentProfile: { ...desktopProfile, peripherals: createDemoProfile().peripherals },
      collectionStatus: { ...state.collectionStatus, peripherals: 'completed' },
      dataSource: 'desktop'
    }));
  },

  collectShares: async () => {
    if (isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, shares: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, shares: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 800));

    const currentProfile = get().profile;
    const desktopProfile = createDesktopProfile(currentProfile);
    set(state => ({
      profile: { ...desktopProfile, shares: createDemoProfile().shares },
      currentProfile: { ...desktopProfile, shares: createDemoProfile().shares },
      collectionStatus: { ...state.collectionStatus, shares: 'completed' },
      dataSource: 'desktop'
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

    const currentProfile = get().profile;
    const desktopProfile = createDesktopProfile(currentProfile);
    set(state => ({
      profile: { ...desktopProfile, users: createDemoProfile().users },
      currentProfile: { ...desktopProfile, users: createDemoProfile().users },
      collectionStatus: { ...state.collectionStatus, users: 'completed' },
      dataSource: 'desktop'
    }));
  },

  collectLoginRecords: async () => {
    if (isRunningInBrowser()) {
      set(state => ({
        collectionStatus: { ...state.collectionStatus, loginRecords: 'unsupported' }
      }));
      return;
    }
    set(state => ({
      collectionStatus: { ...state.collectionStatus, loginRecords: 'collecting' }
    }));
    await new Promise(resolve => setTimeout(resolve, 900));

    const currentProfile = get().profile;
    const desktopProfile = createDesktopProfile(currentProfile);
    set(state => ({
      profile: { ...desktopProfile, loginRecords: createDemoProfile().loginRecords },
      currentProfile: { ...desktopProfile, loginRecords: createDemoProfile().loginRecords },
      collectionStatus: { ...state.collectionStatus, loginRecords: 'completed' },
      dataSource: 'desktop'
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

    if (isRunningInBrowser()) {
      set({
        collectionStatus: {
          software: 'unsupported',
          startupItems: 'unsupported',
          peripherals: 'unsupported',
          shares: 'unsupported',
          users: 'unsupported',
          loginRecords: 'unsupported'
        }
      });
      return;
    }

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
    set(state => ({
      reportConfig: { ...state.reportConfig, notes }
    }));
  },

  updateReportConfig: (config: Partial<ReportConfig>) => {
    set(state => ({
      reportConfig: { ...state.reportConfig, ...config }
    }));
  },

  loadHistoricalProfile: (profile: SystemProfile) => {
    const importedProfile = createProfileFromImport(profile);
    const currentProfile = get().currentProfile || get().profile;
    if (currentProfile) {
      const result = compareProfiles(importedProfile, currentProfile);
      set({
        historicalProfile: importedProfile,
        comparisonResult: result,
        dataSource: 'imported'
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

    const highDiskRisks = risks.filter(r => r.type === 'disk-space' && r.severity === 'high');
    const mediumDiskRisks = risks.filter(r => r.type === 'disk-space' && r.severity === 'medium');

    if (highDiskRisks.length > 0) {
      suggestions.push('【紧急】存在高危磁盘空间不足问题，建议立即清理磁盘或扩展存储');
    }
    if (mediumDiskRisks.length > 0) {
      suggestions.push('【重要】部分磁盘空间接近警戒线，建议及时清理不必要的文件');
    }
    if (risks.some(r => r.type === 'startup' && r.severity === 'high')) {
      suggestions.push('【紧急】检测到高风险启动项，建议禁用可疑程序');
    } else if (risks.some(r => r.type === 'startup')) {
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

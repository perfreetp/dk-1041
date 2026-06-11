import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SystemProfile, RiskItem, ComparisonResult, CollectionStatus, ReportConfig, DataSource, getDataSourceLabel, getDataSourceDescription } from '../types';
import { createDemoProfile, createProfileFromImport, createDesktopProfile, isRunningInBrowser } from '../data/mockData';
import { analyzeRisks } from '../services/analyzer';
import { compareProfiles } from '../services/comparator';

interface PersistedState {
  dataSource: DataSource;
  savedProfile: SystemProfile | null;
  savedReportConfig: ReportConfig | null;
}

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
  switchToDemo: () => void;
  switchToDesktop: () => void;
  isDesktopSupported: () => boolean;
  importProfile: (profile: SystemProfile) => void;
  importReport: (reportData: { systemProfile: SystemProfile; reportConfig?: Partial<ReportConfig> }) => void;
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
  useImportedAsCurrent: () => void;
  clearHistoricalProfile: () => void;
  generateSuggestions: () => void;
  exportCurrentProfile: () => void;
}

const defaultReportConfig: ReportConfig = {
  template: 'standard',
  modules: ['system', 'hardware', 'risks', 'suggestions'],
  includeRisks: true,
  includeSuggestions: true,
  includeNotes: true,
  engineer: '维护工程师',
  processStatus: 'pending',
  notes: ''
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
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
        const state = get();
        if (state.profile) return;

        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 800));

        const savedProfile = state.profile;
        const savedReportConfig = state.reportConfig;

        if (savedProfile) {
          set({
            profile: savedProfile,
            currentProfile: savedProfile,
            isLoading: false,
            lastUpdate: new Date(savedProfile.profileTime).toLocaleString('zh-CN'),
            risks: analyzeRisks(savedProfile)
          });
          if (savedReportConfig) {
            set({ reportConfig: savedReportConfig });
          }
        } else {
          const profile = createDemoProfile();
          set({
            profile,
            currentProfile: profile,
            isLoading: false,
            lastUpdate: new Date().toLocaleString('zh-CN'),
            risks: analyzeRisks(profile)
          });
        }
        get().generateSuggestions();
      },

      isDesktopSupported: () => {
        return !isRunningInBrowser();
      },

      switchToDemo: () => {
        const profile = createDemoProfile();
        set({
          profile,
          currentProfile: profile,
          dataSource: 'demo',
          historicalProfile: null,
          comparisonResult: null,
          lastUpdate: new Date().toLocaleString('zh-CN'),
          risks: analyzeRisks(profile),
          reportConfig: { ...defaultReportConfig },
          collectionStatus: {
            software: 'idle',
            startupItems: 'idle',
            peripherals: 'idle',
            shares: 'idle',
            users: 'idle',
            loginRecords: 'idle'
          }
        });
        get().generateSuggestions();
      },

      switchToDesktop: () => {
        if (isRunningInBrowser()) {
          return;
        }

        const profile = createDesktopProfile(get().profile);
        set({
          profile,
          currentProfile: profile,
          dataSource: 'desktop',
          lastUpdate: new Date().toLocaleString('zh-CN'),
          risks: analyzeRisks(profile),
          historicalProfile: null,
          comparisonResult: null
        });
        get().generateSuggestions();
      },

      importProfile: (importedProfile: SystemProfile) => {
        const profile = createProfileFromImport(importedProfile);
        const newReportConfig = { ...defaultReportConfig };

        if (importedProfile.reportConfig) {
          newReportConfig.template = importedProfile.reportConfig.template || 'standard';
          newReportConfig.modules = importedProfile.reportConfig.modules || ['system', 'hardware', 'risks', 'suggestions'];
          newReportConfig.engineer = importedProfile.reportConfig.engineer || '维护工程师';
          newReportConfig.processStatus = importedProfile.reportConfig.processStatus || 'pending';
          newReportConfig.notes = importedProfile.reportConfig.notes || '';
          newReportConfig.includeRisks = importedProfile.reportConfig.includeRisks ?? true;
          newReportConfig.includeSuggestions = importedProfile.reportConfig.includeSuggestions ?? true;
          newReportConfig.includeNotes = importedProfile.reportConfig.includeNotes ?? true;
        }

        set({
          profile,
          currentProfile: profile,
          dataSource: 'imported',
          historicalProfile: null,
          comparisonResult: null,
          lastUpdate: new Date(profile.profileTime).toLocaleString('zh-CN'),
          risks: analyzeRisks(profile),
          reportConfig: newReportConfig
        });
        get().generateSuggestions();
      },

      importReport: (reportData: { systemProfile: SystemProfile; reportConfig?: Partial<ReportConfig> }) => {
        const profile = createProfileFromImport(reportData.systemProfile);
        const newReportConfig = { ...defaultReportConfig };

        if (reportData.reportConfig) {
          newReportConfig.template = reportData.reportConfig.template || 'standard';
          newReportConfig.modules = reportData.reportConfig.modules || ['system', 'hardware', 'risks', 'suggestions'];
          newReportConfig.engineer = reportData.reportConfig.engineer || '维护工程师';
          newReportConfig.processStatus = reportData.reportConfig.processStatus || 'pending';
          newReportConfig.notes = reportData.reportConfig.notes || '';
          newReportConfig.includeRisks = reportData.reportConfig.includeRisks ?? true;
          newReportConfig.includeSuggestions = reportData.reportConfig.includeSuggestions ?? true;
          newReportConfig.includeNotes = reportData.reportConfig.includeNotes ?? true;
        }

        set({
          profile,
          currentProfile: profile,
          dataSource: 'imported',
          historicalProfile: null,
          comparisonResult: null,
          lastUpdate: new Date(profile.profileTime).toLocaleString('zh-CN'),
          risks: analyzeRisks(profile),
          reportConfig: newReportConfig
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
        const currentDataSource = get().dataSource;

        if (currentProfile) {
          const result = compareProfiles(importedProfile, currentProfile);
          set({
            historicalProfile: importedProfile,
            comparisonResult: result,
            dataSource: currentDataSource
          });
        }
      },

      useImportedAsCurrent: () => {
        const { historicalProfile, profile } = get();
        if (historicalProfile && profile) {
          const result = compareProfiles(profile, historicalProfile);
          set({
            historicalProfile: profile,
            currentProfile: historicalProfile,
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

        const highRisks = risks.filter(r => r.severity === 'high');
        const mediumRisks = risks.filter(r => r.severity === 'medium');
        const lowRisks = risks.filter(r => r.severity === 'low');

        highRisks.forEach(risk => {
          suggestions.push(`【高危】${risk.title}：${risk.description}`);
        });

        mediumRisks.forEach(risk => {
          suggestions.push(`【中危】${risk.title}：${risk.description}`);
        });

        lowRisks.forEach(risk => {
          suggestions.push(`【低危】${risk.title}：${risk.description}`);
        });

        if (suggestions.length === 0) {
          suggestions.push('系统状态良好，建议保持定期维护习惯');
        }

        set({ maintenanceSuggestions: suggestions });
      },

      exportCurrentProfile: () => {
        const { profile, reportConfig, dataSource } = get();
        if (!profile) return;

        const exportData = {
          ...profile,
          dataSource: profile.dataSource || dataSource,
          dataSourceLabel: getDataSourceLabel(profile.dataSource || dataSource),
          dataSourceDescription: getDataSourceDescription(profile.dataSource || dataSource),
          reportConfig: {
            template: reportConfig.template,
            modules: reportConfig.modules,
            engineer: reportConfig.engineer,
            processStatus: reportConfig.processStatus,
            notes: reportConfig.notes,
            includeRisks: reportConfig.includeRisks,
            includeSuggestions: reportConfig.includeSuggestions,
            includeNotes: reportConfig.includeNotes,
            exportedAt: new Date().toISOString()
          }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `host-profile-${profile.hostname}-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }),
    {
      name: 'host-profiler-storage',
      partialize: (state) => ({
        dataSource: state.dataSource,
        profile: state.profile,
        reportConfig: state.reportConfig
      })
    }
  )
);

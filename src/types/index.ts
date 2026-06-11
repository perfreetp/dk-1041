export type DataSource = 'demo' | 'desktop' | 'imported';

export interface MemorySlot {
  slot: string;
  size: number;
  type: string;
  speed: number;
  manufacturer: string;
}

export interface Disk {
  letter: string;
  label: string;
  total: number;
  used: number;
  free: number;
  fileSystem: string;
}

export interface NetworkAdapter {
  name: string;
  type: string;
  mac: string;
  ipv4: string;
  ipv6: string;
  status: 'connected' | 'disconnected';
}

export interface Software {
  id: string;
  name: string;
  version: string;
  vendor: string;
  installDate: string;
  lastUpdate: string;
  size: number;
}

export interface StartupItem {
  id: string;
  name: string;
  path: string;
  location: 'registry' | 'startup-folder' | 'scheduled-task';
  enabled: boolean;
  publisher: string;
  signed: boolean;
}

export interface Peripheral {
  id: string;
  name: string;
  type: 'input' | 'storage' | 'network' | 'display' | 'other';
  status: 'connected' | 'disconnected';
  driver: string;
}

export interface SharedFolder {
  id: string;
  name: string;
  path: string;
  permissions: string[];
  connectedUsers: number;
}

export interface UserAccount {
  id: string;
  username: string;
  type: 'admin' | 'standard' | 'guest';
  lastLogin: string;
  groups: string[];
  disabled: boolean;
}

export interface LoginRecord {
  id: string;
  time: string;
  username: string;
  source: string;
  type: 'local' | 'domain';
}

export interface SystemProfile {
  hostname: string;
  os: { name: string; version: string; build: string };
  cpu: { model: string; cores: number; threads: number };
  memory: { total: number; used: number; slots: MemorySlot[] };
  disks: Disk[];
  network: NetworkAdapter[];
  software: Software[];
  startupItems: StartupItem[];
  peripherals: Peripheral[];
  shares: SharedFolder[];
  users: UserAccount[];
  loginRecords: LoginRecord[];
  profileTime: string;
  dataSource: DataSource;
  sourceDescription?: string;
}

export interface RiskItem {
  id: string;
  type: 'disk-space' | 'startup' | 'outdated-software' | 'open-share';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  relatedData: unknown;
}

export interface ComparisonItem {
  category: string;
  name: string;
  value?: string;
  detail?: string;
}

export interface ChangedItem {
  category: string;
  name: string;
  oldValue: string;
  newValue: string;
}

export interface DiskChange {
  disk: string;
  oldTotal: number;
  newTotal: number;
  oldFree: number;
  newFree: number;
  oldUsed: number;
  newUsed: number;
  oldUsedPercent: number;
  newUsedPercent: number;
}

export interface ComparisonResult {
  added: ComparisonItem[];
  removed: ComparisonItem[];
  changed: ChangedItem[];
  diskChanges: {
    added: Disk[];
    removed: Disk[];
    capacityChanged: DiskChange[];
  };
  summary: {
    hardwareChanges: number;
    softwareAdded: number;
    softwareRemoved: number;
    configChanges: number;
  };
}

export interface CollectionStatus {
  software: 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';
  startupItems: 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';
  peripherals: 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';
  shares: 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';
  users: 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';
  loginRecords: 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';
}

export type ReportTemplate = 'standard' | 'detailed' | 'simple';
export type ReportModule = 'system' | 'software' | 'hardware' | 'risks' | 'suggestions' | 'notes';

export interface ReportConfig {
  template: ReportTemplate;
  modules: ReportModule[];
  includeRisks: boolean;
  includeSuggestions: boolean;
  includeNotes: boolean;
  engineer: string;
  processStatus: 'pending' | 'processing' | 'completed';
  notes: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const clampedI = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, clampedI)).toFixed(decimals)) + ' ' + sizes[clampedI];
}

export function bytesToGB(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function getDataSourceLabel(source: DataSource): string {
  switch (source) {
    case 'demo': return '浏览器演示';
    case 'desktop': return '桌面采集';
    case 'imported': return '导入档案';
    default: return '未知来源';
  }
}

export function getDataSourceDescription(source: DataSource): string {
  switch (source) {
    case 'demo': return '当前显示的是演示数据，请导入真实档案或使用桌面应用采集';
    case 'desktop': return '数据来自本机实时采集';
    case 'imported': return '数据来自导入的历史档案文件';
    default: return '';
  }
}

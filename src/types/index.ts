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
}

export interface ChangedItem {
  category: string;
  name: string;
  oldValue: string;
  newValue: string;
}

export interface ComparisonResult {
  added: ComparisonItem[];
  removed: ComparisonItem[];
  changed: ChangedItem[];
  summary: {
    hardwareChanges: number;
    softwareAdded: number;
    softwareRemoved: number;
    configChanges: number;
  };
}

export interface CollectionStatus {
  software: 'idle' | 'collecting' | 'completed' | 'error';
  startupItems: 'idle' | 'collecting' | 'completed' | 'error';
  peripherals: 'idle' | 'collecting' | 'completed' | 'error';
  shares: 'idle' | 'collecting' | 'completed' | 'error';
  users: 'idle' | 'collecting' | 'completed' | 'error';
  loginRecords: 'idle' | 'collecting' | 'completed' | 'error';
}

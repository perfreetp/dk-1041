import { SystemProfile } from '../types';

const MB = 1024 * 1024;
const GB = 1024 * 1024 * 1024;

export function createDemoProfile(): SystemProfile {
  return {
    hostname: 'OFFICE-PC-0427',
    os: {
      name: 'Windows 11 专业版',
      version: '23H2',
      build: '22631.3155'
    },
    cpu: {
      model: 'Intel Core i7-12700K',
      cores: 12,
      threads: 20
    },
    memory: {
      total: 32 * GB,
      used: 18 * GB,
      slots: [
        { slot: 'DIMM_A1', size: 8 * GB, type: 'DDR5', speed: 4800, manufacturer: 'Kingston' },
        { slot: 'DIMM_B1', size: 8 * GB, type: 'DDR5', speed: 4800, manufacturer: 'Kingston' },
        { slot: 'DIMM_C1', size: 8 * GB, type: 'DDR5', speed: 4800, manufacturer: 'Kingston' },
        { slot: 'DIMM_D1', size: 8 * GB, type: 'DDR5', speed: 4800, manufacturer: 'Kingston' }
      ]
    },
    disks: [
      { letter: 'C:', label: '系统盘', total: 512 * GB, used: 387 * GB, free: 125 * GB, fileSystem: 'NTFS' },
      { letter: 'D:', label: '数据盘', total: 1024 * GB, used: 756 * GB, free: 268 * GB, fileSystem: 'NTFS' },
      { letter: 'E:', label: '备份盘', total: 2048 * GB, used: 1245 * GB, free: 803 * GB, fileSystem: 'NTFS' }
    ],
    network: [
      {
        name: 'Intel(R) Ethernet Connection (17) I219-V',
        type: '以太网',
        mac: 'A4:4E:31:7B:8C:12',
        ipv4: '192.168.1.105',
        ipv6: 'fe80::3c5a:8ff:fe2d:9f1a',
        status: 'connected'
      },
      {
        name: 'Intel(R) Wi-Fi 6E AX211 160MHz',
        type: 'Wi-Fi',
        mac: '3C:5A:B4:2D:9F:1B',
        ipv4: '192.168.1.108',
        ipv6: 'fe80::1c8f:e4ff:fe8a:3d1c',
        status: 'connected'
      }
    ],
    software: [
      { id: '1', name: 'Microsoft Office 专业增强版 2021', version: '16.0.14332.20481', vendor: 'Microsoft Corporation', installDate: '2024-01-15', lastUpdate: '2024-02-12', size: 4500 * MB },
      { id: '2', name: 'Google Chrome', version: '121.0.6167.184', vendor: 'Google LLC', installDate: '2023-08-20', lastUpdate: '2024-02-08', size: 250 * MB },
      { id: '3', name: 'Adobe Acrobat Pro DC', version: '24.001.20604', vendor: 'Adobe Inc.', installDate: '2023-11-05', lastUpdate: '2023-11-28', size: 1200 * MB },
      { id: '4', name: 'WinRAR 简体中文版', version: '7.00', vendor: 'win.rar GmbH', installDate: '2022-05-18', lastUpdate: '2023-06-15', size: 3.5 * MB },
      { id: '5', name: '钉钉', version: '7.0.30.40600', vendor: '阿里巴巴', installDate: '2024-01-10', lastUpdate: '2024-02-10', size: 280 * MB },
      { id: '6', name: '企业微信', version: '4.0.20.60218', vendor: '腾讯', installDate: '2023-09-12', lastUpdate: '2024-01-25', size: 320 * MB },
      { id: '7', name: 'Visual Studio Code', version: '1.86.2', vendor: 'Microsoft Corporation', installDate: '2023-12-01', lastUpdate: '2024-02-05', size: 120 * MB },
      { id: '8', name: '7-Zip', version: '23.01', vendor: 'Igor Pavlov', installDate: '2022-03-20', lastUpdate: '2023-08-10', size: 2 * MB },
      { id: '9', name: 'Foxmail', version: '7.2.25.146', vendor: '腾讯', installDate: '2023-06-15', lastUpdate: '2024-01-18', size: 95 * MB },
      { id: '10', name: '360安全卫士', version: '15.0.0.1203', vendor: '奇虎360', installDate: '2022-08-10', lastUpdate: '2024-02-01', size: 180 * MB }
    ],
    startupItems: [
      { id: '1', name: 'ctfmon.exe', path: 'C:\\Windows\\System32\\ctfmon.exe', location: 'registry', enabled: true, publisher: 'Microsoft Corporation', signed: true },
      { id: '2', name: 'OneDrive', path: 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe', location: 'registry', enabled: true, publisher: 'Microsoft Corporation', signed: true },
      { id: '3', name: 'WeChat', path: 'C:\\Program Files\\Tencent\\WeChat\\WeChat.exe', location: 'registry', enabled: true, publisher: 'Tencent', signed: true },
      { id: '4', name: 'DingTalk', path: 'C:\\Users\\Admin\\AppData\\Roaming\\DingTalk\\DingTalk.exe', location: 'registry', enabled: true, publisher: 'Alibaba', signed: true },
      { id: '5', name: 'SysHelper', path: 'C:\\Program Files\\SysHelper\\syshelper.exe', location: 'registry', enabled: true, publisher: 'Unknown', signed: false },
      { id: '6', name: 'GameBox', path: 'C:\\ProgramData\\GameBox\\launcher.exe', location: 'startup-folder', enabled: false, publisher: 'Unknown', signed: false }
    ],
    peripherals: [
      { id: '1', name: 'Dell U2722D 显示器', type: 'display', status: 'connected', driver: '8.5.1' },
      { id: '2', name: 'Logitech MX Keys', type: 'input', status: 'connected', driver: '30.4.28' },
      { id: '3', name: 'Logitech MX Master 3S', type: 'input', status: 'connected', driver: '10.10.14' },
      { id: '4', name: 'USB Camera', type: 'input', status: 'disconnected', driver: '1.0.0' },
      { id: '5', name: 'Samsung Portable SSD T7', type: 'storage', status: 'connected', driver: '2.0.0' }
    ],
    shares: [
      { id: '1', name: 'Documents', path: 'C:\\Users\\Public\\Documents', permissions: ['Everyone:Read'], connectedUsers: 0 },
      { id: '2', name: 'Projects', path: 'D:\\Projects', permissions: ['Domain Users:Read/Write'], connectedUsers: 3 }
    ],
    users: [
      { id: '1', username: 'Administrator', type: 'admin', lastLogin: '2024-02-10 08:30:00', groups: ['Administrators', 'Users'], disabled: false },
      { id: '2', username: 'Admin', type: 'admin', lastLogin: '2024-02-15 09:15:00', groups: ['Administrators', 'Users'], disabled: false },
      { id: '3', username: 'Guest', type: 'guest', lastLogin: '2023-12-01 14:22:00', groups: ['Guests'], disabled: true },
      { id: '4', username: 'DevUser', type: 'standard', lastLogin: '2024-02-14 18:45:00', groups: ['Users', 'Developers'], disabled: false }
    ],
    loginRecords: [
      { id: '1', time: '2024-02-15 08:45:32', username: 'Admin', source: 'LOCAL', type: 'local' },
      { id: '2', time: '2024-02-14 18:32:15', username: 'DevUser', source: 'LOCAL', type: 'local' },
      { id: '3', time: '2024-02-14 08:50:01', username: 'Admin', source: 'LOCAL', type: 'local' },
      { id: '4', time: '2024-02-13 17:22:45', username: 'Admin', source: '192.168.1.100', type: 'domain' },
      { id: '5', time: '2024-02-13 08:35:18', username: 'Admin', source: 'LOCAL', type: 'local' }
    ],
    profileTime: new Date().toISOString(),
    dataSource: 'demo'
  };
}

export const mockHistoricalProfile: SystemProfile = {
  ...createDemoProfile(),
  hostname: 'OFFICE-PC-0427',
  software: createDemoProfile().software.filter((_, i) => i < 7),
  disks: [
    { letter: 'C:', label: '系统盘', total: 512 * GB, used: 320 * GB, free: 192 * GB, fileSystem: 'NTFS' },
    { letter: 'D:', label: '数据盘', total: 1024 * GB, used: 680 * GB, free: 344 * GB, fileSystem: 'NTFS' }
  ],
  profileTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  dataSource: 'imported',
  sourceDescription: '历史导入档案'
};

export function isRunningInBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getSystemInfoUnsupportedMessage(): string {
  return '当前运行环境为浏览器，无法直接获取系统信息。请在 Electron/Tauri 等桌面应用中运行以获取真实数据，或导入历史画像文件进行对比分析。';
}

export function createProfileFromImport(profile: SystemProfile): SystemProfile {
  return {
    ...profile,
    dataSource: 'imported',
    sourceDescription: `导入档案 (${profile.hostname})`
  };
}

export function createDesktopProfile(profile?: Partial<SystemProfile> | null): SystemProfile {
  return {
    ...createDemoProfile(),
    ...(profile || {}),
    dataSource: 'desktop',
    sourceDescription: '本机实时采集'
  };
}

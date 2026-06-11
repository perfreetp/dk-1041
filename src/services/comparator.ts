import { SystemProfile, ComparisonResult, ComparisonItem, ChangedItem } from '../types';

export function compareProfiles(historical: SystemProfile, current: SystemProfile): ComparisonResult {
  const added: ComparisonItem[] = [];
  const removed: ComparisonItem[] = [];
  const changed: ChangedItem[] = [];
  let hardwareChanges = 0;
  let softwareAdded = 0;
  let softwareRemoved = 0;
  let configChanges = 0;

  if (historical.cpu.model !== current.cpu.model) {
    changed.push({
      category: '硬件',
      name: 'CPU',
      oldValue: historical.cpu.model,
      newValue: current.cpu.model
    });
    hardwareChanges++;
  }

  if (historical.memory.total !== current.memory.total) {
    changed.push({
      category: '硬件',
      name: '内存',
      oldValue: `${historical.memory.total / 1024} GB`,
      newValue: `${current.memory.total / 1024} GB`
    });
    hardwareChanges++;
  }

  const oldDiskCount = historical.disks.length;
  const newDiskCount = current.disks.length;
  if (oldDiskCount !== newDiskCount) {
    if (newDiskCount > oldDiskCount) {
      current.disks.slice(oldDiskCount).forEach(disk => {
        added.push({
          category: '硬件',
          name: `磁盘${disk.letter}`,
          value: `${disk.label} (${(disk.total / 1024 / 1024).toFixed(0)} GB)`
        });
      });
    } else {
      historical.disks.slice(newDiskCount).forEach(disk => {
        removed.push({
          category: '硬件',
          name: `磁盘${disk.letter}`,
          value: `${disk.label} (${(disk.total / 1024 / 1024).toFixed(0)} GB)`
        });
      });
    }
    hardwareChanges++;
  }

  historical.disks.forEach((oldDisk, index) => {
    const newDisk = current.disks[index];
    if (newDisk && oldDisk.used !== newDisk.used) {
      changed.push({
        category: '配置',
        name: `磁盘${oldDisk.letter}使用量`,
        oldValue: `${(oldDisk.used / 1024 / 1024).toFixed(0)} GB`,
        newValue: `${(newDisk.used / 1024 / 1024).toFixed(0)} GB`
      });
      configChanges++;
    }
  });

  const oldSoftwareNames = new Set(historical.software.map(s => s.name));
  const newSoftwareNames = new Set(current.software.map(s => s.name));

  current.software.forEach(software => {
    if (!oldSoftwareNames.has(software.name)) {
      added.push({
        category: '软件',
        name: software.name,
        value: software.version
      });
      softwareAdded++;
    }
  });

  historical.software.forEach(software => {
    if (!newSoftwareNames.has(software.name)) {
      removed.push({
        category: '软件',
        name: software.name,
        value: software.version
      });
      softwareRemoved++;
    }
  });

  const oldStartupNames = new Set(historical.startupItems.map(s => s.name));
  const newStartupNames = new Set(current.startupItems.map(s => s.name));

  current.startupItems.forEach(item => {
    if (!oldStartupNames.has(item.name)) {
      added.push({
        category: '启动项',
        name: item.name,
        value: item.enabled ? '已启用' : '已禁用'
      });
      configChanges++;
    }
  });

  historical.startupItems.forEach(item => {
    if (!newStartupNames.has(item.name)) {
      removed.push({
        category: '启动项',
        name: item.name
      });
      configChanges++;
    }
  });

  return {
    added,
    removed,
    changed,
    summary: {
      hardwareChanges,
      softwareAdded,
      softwareRemoved,
      configChanges
    }
  };
}

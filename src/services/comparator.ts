import { SystemProfile, ComparisonResult, ComparisonItem, ChangedItem, Disk, bytesToGB } from '../types';

export function compareProfiles(historical: SystemProfile, current: SystemProfile): ComparisonResult {
  const added: ComparisonItem[] = [];
  const removed: ComparisonItem[] = [];
  const changed: ChangedItem[] = [];
  const diskChanges = {
    added: [] as Disk[],
    removed: [] as Disk[],
    capacityChanged: [] as { disk: string; oldTotal: number; newTotal: number; oldFree: number; newFree: number }[]
  };
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
      oldValue: `${bytesToGB(historical.memory.total).toFixed(1)} GB`,
      newValue: `${bytesToGB(current.memory.total).toFixed(1)} GB`
    });
    hardwareChanges++;
  }

  const historicalDisksMap = new Map(historical.disks.map(d => [d.letter, d]));
  const currentDisksMap = new Map(current.disks.map(d => [d.letter, d]));

  current.disks.forEach(disk => {
    if (!historicalDisksMap.has(disk.letter)) {
      diskChanges.added.push(disk);
    }
  });

  historical.disks.forEach(disk => {
    if (!currentDisksMap.has(disk.letter)) {
      diskChanges.removed.push(disk);
    }
  });

  historical.disks.forEach(historicalDisk => {
    const currentDisk = currentDisksMap.get(historicalDisk.letter);
    if (currentDisk) {
      if (historicalDisk.total !== currentDisk.total ||
          historicalDisk.used !== currentDisk.used ||
          historicalDisk.free !== currentDisk.free) {
        diskChanges.capacityChanged.push({
          disk: historicalDisk.letter,
          oldTotal: historicalDisk.total,
          newTotal: currentDisk.total,
          oldFree: historicalDisk.free,
          newFree: currentDisk.free
        });
      }
    }
  });

  if (diskChanges.added.length > 0 || diskChanges.removed.length > 0 || diskChanges.capacityChanged.length > 0) {
    hardwareChanges++;
  }

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
    diskChanges,
    summary: {
      hardwareChanges,
      softwareAdded,
      softwareRemoved,
      configChanges
    }
  };
}

import { SystemProfile, RiskItem, bytesToGB } from '../types';

export function analyzeRisks(profile: SystemProfile): RiskItem[] {
  const risks: RiskItem[] = [];
  const today = new Date();

  profile.disks.forEach((disk, index) => {
    const freeGB = bytesToGB(disk.free);
    const usedPercent = (disk.used / disk.total) * 100;

    if (freeGB < 10 || usedPercent > 90) {
      risks.push({
        id: `disk-${index}`,
        type: 'disk-space',
        severity: freeGB < 5 || usedPercent > 95 ? 'high' : 'medium',
        title: `磁盘${disk.letter}空间不足`,
        description: `${disk.letter}盘（${disk.label}）可用空间仅剩 ${freeGB.toFixed(1)} GB，使用率 ${usedPercent.toFixed(1)}%`,
        suggestion: '建议：1. 清理临时文件 2. 转移大文件到其他磁盘 3. 卸载不常用的软件',
        relatedData: disk
      });
    }
  });

  const knownPublishers = ['Microsoft Corporation', 'Google LLC', 'Adobe Inc.', 'Tencent', '阿里巴巴', 'Intel Corporation'];

  profile.startupItems.forEach((item, index) => {
    const isKnownPublisher = knownPublishers.some(p => item.publisher.includes(p));

    if (!item.signed || (!isKnownPublisher && item.publisher === 'Unknown')) {
      risks.push({
        id: `startup-${index}`,
        type: 'startup',
        severity: !item.signed ? 'medium' : 'low',
        title: `异常启动项：${item.name}`,
        description: `启动项"${item.name}"来源不明${!item.signed ? '且无数字签名' : ''}，路径：${item.path}`,
        suggestion: '建议：确认是否为必要启动项，如不了解建议禁用',
        relatedData: item
      });
    }
  });

  profile.software.forEach((software, index) => {
    const lastUpdate = new Date(software.lastUpdate);
    const daysSinceUpdate = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate > 180) {
      risks.push({
        id: `software-${index}`,
        type: 'outdated-software',
        severity: daysSinceUpdate > 365 ? 'medium' : 'low',
        title: `软件长期未更新：${software.name}`,
        description: `${software.name} (${software.version}) 已 ${daysSinceUpdate} 天未更新`,
        suggestion: '建议：检查是否有新版本发布，及时更新以获取安全补丁',
        relatedData: software
      });
    }
  });

  profile.shares.forEach((share, index) => {
    if (share.permissions.some(p => p.includes('Everyone'))) {
      risks.push({
        id: `share-${index}`,
        type: 'open-share',
        severity: 'medium',
        title: `存在开放共享：${share.name}`,
        description: `共享"${share.name}"允许Everyone组访问，存在安全风险`,
        suggestion: '建议：修改访问权限为特定用户或用户组，必要时关闭共享',
        relatedData: share
      });
    }
  });

  return risks.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

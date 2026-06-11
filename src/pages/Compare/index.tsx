import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  GitCompare,
  Upload,
  FileJson,
  Plus,
  Minus,
  Edit3,
  X,
  Monitor,
  History,
  HardDrive,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { SystemProfile, bytesToGB, formatBytes } from '../../types';

function DiskComparison({ changes }: {
  changes: {
    added: { letter: string; label: string; total: number; used: number; free: number; fileSystem?: string }[];
    removed: { letter: string; label: string; total: number; used: number; free: number; fileSystem?: string }[];
    capacityChanged: {
      disk: string;
      oldTotal: number;
      newTotal: number;
      oldFree: number;
      newFree: number;
      oldUsed: number;
      newUsed: number;
      oldUsedPercent: number;
      newUsedPercent: number;
    }[];
  };
}) {
  const { added, removed, capacityChanged } = changes;

  const hasAnyChanges = added.length > 0 || removed.length > 0 || capacityChanged.length > 0;

  if (!hasAnyChanges) {
    return (
      <div className="text-center py-8 text-slate-500">
        磁盘无变更
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(added.length > 0 || removed.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
            新增 / 移除磁盘
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {added.map(disk => {
              const usedPercent = (disk.used / disk.total) * 100;
              return (
                <div key={`add-${disk.letter}`} className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{disk.letter} {disk.label}</p>
                    <p className="text-sm text-success">新增 · {bytesToGB(disk.total).toFixed(0)} GB {disk.fileSystem ? `(${disk.fileSystem})` : ''}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>已用: {formatBytes(disk.used)}</span>
                      <span>可用: {formatBytes(disk.free)}</span>
                      <span className={usedPercent > 90 ? 'text-danger' : usedPercent > 80 ? 'text-warning' : 'text-success'}>
                        {usedPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {removed.map(disk => {
              const usedPercent = (disk.used / disk.total) * 100;
              return (
                <div key={`remove-${disk.letter}`} className="flex items-center gap-3 p-3 bg-danger/10 border border-danger/30 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center">
                    <Minus className="w-4 h-4 text-danger" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{disk.letter} {disk.label}</p>
                    <p className="text-sm text-danger">移除 · {bytesToGB(disk.total).toFixed(0)} GB {disk.fileSystem ? `(${disk.fileSystem})` : ''}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>已用: {formatBytes(disk.used)}</span>
                      <span>可用: {formatBytes(disk.free)}</span>
                      <span>{usedPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {capacityChanged.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
            容量变化（按盘符）
          </h4>
          <div className="space-y-3">
            {capacityChanged.map(change => (
              <div key={change.disk} className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{change.disk}</p>
                    <p className="text-xs text-slate-400">磁盘容量与使用情况变化</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">总容量</p>
                    <p className="text-sm text-slate-300 font-mono">
                      {bytesToGB(change.oldTotal).toFixed(0)} → {bytesToGB(change.newTotal).toFixed(0)} GB
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">已用空间</p>
                    <p className="text-sm text-slate-300 font-mono">
                      {bytesToGB(change.oldUsed).toFixed(0)} → {bytesToGB(change.newUsed).toFixed(0)} GB
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">可用空间</p>
                    <p className="text-sm text-slate-300 font-mono">
                      {bytesToGB(change.oldFree).toFixed(0)} → {bytesToGB(change.newFree).toFixed(0)} GB
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">使用率</p>
                    <p className={`text-sm font-mono ${
                      change.newUsedPercent > change.oldUsedPercent ? 'text-danger' :
                      change.newUsedPercent < change.oldUsedPercent ? 'text-success' : 'text-slate-300'
                    }`}>
                      {change.oldUsedPercent.toFixed(1)}% → {change.newUsedPercent.toFixed(1)}%
                      {change.newUsedPercent > change.oldUsedPercent ? ' ↑' :
                       change.newUsedPercent < change.oldUsedPercent ? ' ↓' : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">历史</span>
                      <span className="text-slate-400">{change.oldUsedPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(change.oldUsedPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">当前</span>
                      <span className={change.newUsedPercent > 90 ? 'text-danger' : 'text-slate-400'}>
                        {change.newUsedPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          change.newUsedPercent > 90 ? 'bg-danger' :
                          change.newUsedPercent > 80 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(change.newUsedPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonTable({ data, type }: { data: { category: string; name: string; value?: string }[]; type: 'added' | 'removed' }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        暂无{type === 'added' ? '新增' : '删除'}项
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            type === 'added' ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            type === 'added' ? 'bg-success/20' : 'bg-danger/20'
          }`}>
            {type === 'added' ? (
              <Plus className="w-4 h-4 text-success" />
            ) : (
              <Minus className="w-4 h-4 text-danger" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{item.name}</p>
            <p className="text-xs text-slate-500">{item.category}</p>
          </div>
          {item.value && (
            <span className="text-xs text-slate-400 font-mono">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ChangesTable({ data }: { data: { category: string; name: string; oldValue: string; newValue: string }[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        暂无变更项
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-white">{item.name}</span>
            <span className="text-xs text-slate-500">{item.category}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded p-2">
              <p className="text-xs text-slate-500 mb-1">历史值</p>
              <p className="text-sm text-slate-300 font-mono">{item.oldValue}</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <p className="text-xs text-slate-500 mb-1">当前值</p>
              <p className="text-sm text-slate-300 font-mono">{item.newValue}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const {
    profile,
    historicalProfile,
    comparisonResult,
    loadHistoricalProfile,
    clearHistoricalProfile,
    loadProfile
  } = useAppStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const generateChangeSummary = useCallback(() => {
    if (!comparisonResult) return '';

    const lines: string[] = [];

    if (historicalProfile && profile) {
      lines.push(`【主机画像变更对比】`);
      lines.push(`主机名：${profile.hostname}`);
      lines.push(`对比时间：${new Date().toLocaleString('zh-CN')}`);
      lines.push('');
    }

    if (comparisonResult.diskChanges.added.length > 0) {
      lines.push('【磁盘变更】');
      comparisonResult.diskChanges.added.forEach(disk => {
        const usedPercent = (disk.used / disk.total) * 100;
        lines.push(`+ 新增磁盘 ${disk.letter} ${disk.label}：总容量 ${bytesToGB(disk.total).toFixed(0)}GB，已用 ${formatBytes(disk.used)}，可用 ${formatBytes(disk.free)}，使用率 ${usedPercent.toFixed(1)}%`);
      });
      comparisonResult.diskChanges.removed.forEach(disk => {
        lines.push(`- 移除磁盘 ${disk.letter} ${disk.label}：总容量 ${bytesToGB(disk.total).toFixed(0)}GB`);
      });
      comparisonResult.diskChanges.capacityChanged.forEach(change => {
        const changeType = change.newUsedPercent > change.oldUsedPercent ? '使用率上升' : '使用率下降';
        lines.push(`* 磁盘 ${change.disk} 容量变化：${bytesToGB(change.oldTotal).toFixed(0)}GB → ${bytesToGB(change.newTotal).toFixed(0)}GB，${changeType} ${Math.abs(change.newUsedPercent - change.oldUsedPercent).toFixed(1)}%`);
      });
      lines.push('');
    }

    const softwareAdded = comparisonResult.added.filter(item => item.category === '软件');
    const softwareRemoved = comparisonResult.removed.filter(item => item.category === '软件');
    if (softwareAdded.length > 0 || softwareRemoved.length > 0) {
      lines.push('【软件变更】');
      if (softwareAdded.length > 0) {
        lines.push(`新增软件 ${softwareAdded.length} 个：`);
        softwareAdded.slice(0, 5).forEach(item => {
          lines.push(`+ ${item.name}${item.value ? ` (${item.value})` : ''}`);
        });
        if (softwareAdded.length > 5) {
          lines.push(`  ...另有 ${softwareAdded.length - 5} 个`);
        }
      }
      if (softwareRemoved.length > 0) {
        lines.push(`移除软件 ${softwareRemoved.length} 个：`);
        softwareRemoved.slice(0, 5).forEach(item => {
          lines.push(`- ${item.name}${item.value ? ` (${item.value})` : ''}`);
        });
        if (softwareRemoved.length > 5) {
          lines.push(`  ...另有 ${softwareRemoved.length - 5} 个`);
        }
      }
      lines.push('');
    }

    const startupAdded = comparisonResult.added.filter(item => item.category === '启动项');
    const startupRemoved = comparisonResult.removed.filter(item => item.category === '启动项');
    if (startupAdded.length > 0 || startupRemoved.length > 0) {
      lines.push('【启动项变更】');
      if (startupAdded.length > 0) {
        lines.push(`新增启动项 ${startupAdded.length} 个：`);
        startupAdded.slice(0, 3).forEach(item => {
          lines.push(`+ ${item.name}`);
        });
        if (startupAdded.length > 3) {
          lines.push(`  ...另有 ${startupAdded.length - 3} 个`);
        }
      }
      if (startupRemoved.length > 0) {
        lines.push(`移除启动项 ${startupRemoved.length} 个：`);
        startupRemoved.slice(0, 3).forEach(item => {
          lines.push(`- ${item.name}`);
        });
        if (startupRemoved.length > 3) {
          lines.push(`  ...另有 ${startupRemoved.length - 3} 个`);
        }
      }
      lines.push('');
    }

    const shareAdded = comparisonResult.added.filter(item => item.category === '共享目录');
    const shareRemoved = comparisonResult.removed.filter(item => item.category === '共享目录');
    if (shareAdded.length > 0 || shareRemoved.length > 0) {
      lines.push('【共享目录变更】');
      if (shareAdded.length > 0) {
        lines.push(`新增共享 ${shareAdded.length} 个：`);
        shareAdded.slice(0, 3).forEach(item => {
          lines.push(`+ ${item.name}${item.detail ? ` (${item.detail})` : ''}`);
        });
        if (shareAdded.length > 3) {
          lines.push(`  ...另有 ${shareAdded.length - 3} 个`);
        }
      }
      if (shareRemoved.length > 0) {
        lines.push(`移除共享 ${shareRemoved.length} 个：`);
        shareRemoved.slice(0, 3).forEach(item => {
          lines.push(`- ${item.name}`);
        });
        if (shareRemoved.length > 3) {
          lines.push(`  ...另有 ${shareRemoved.length - 3} 个`);
        }
      }
      lines.push('');
    }

    const changedItems = comparisonResult.changed.filter(item =>
      item.category !== '磁盘' && item.category !== '内存'
    );
    if (changedItems.length > 0) {
      lines.push('【配置变更】');
      changedItems.slice(0, 5).forEach(item => {
        lines.push(`* ${item.name}：${item.oldValue} → ${item.newValue}`);
      });
      if (changedItems.length > 5) {
        lines.push(`  ...另有 ${changedItems.length - 5} 项配置变更`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push(`变更汇总：新增 ${comparisonResult.added.length} 项，移除 ${comparisonResult.removed.length} 项，配置变更 ${comparisonResult.changed.length} 项`);

    return lines.join('\n');
  }, [comparisonResult, historicalProfile, profile]);

  const handleCopySummary = useCallback(() => {
    const summary = generateChangeSummary();
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generateChangeSummary]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as SystemProfile;
        loadHistoricalProfile(data);
      } catch {
        alert('无效的JSON文件格式');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [loadHistoricalProfile]);

  const hasChanges = comparisonResult && (
    comparisonResult.added.length > 0 ||
    comparisonResult.removed.length > 0 ||
    comparisonResult.changed.length > 0 ||
    comparisonResult.diskChanges.added.length > 0 ||
    comparisonResult.diskChanges.removed.length > 0 ||
    comparisonResult.diskChanges.capacityChanged.length > 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">历史对比</h1>
          <p className="text-slate-400 text-sm mt-1">分析系统变更与配置差异</p>
        </div>
        <div className="flex items-center gap-3">
          {historicalProfile && (
            <button
              onClick={clearHistoricalProfile}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              清除对比
            </button>
          )}
          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            导入历史档案
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {!historicalProfile ? (
        <div className="card-glow p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <FileJson className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">导入历史画像</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            请上传之前保存的主机画像JSON文件，系统将自动对比当前状态与历史状态，分析变更情况
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <History className="w-4 h-4" />
              支持历史档案导入
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <GitCompare className="w-4 h-4" />
              自动变更检测
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="card-glow p-4 border-l-4 border-l-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <History className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">历史档案</p>
                  <p className="text-white font-medium">{historicalProfile.hostname}</p>
                  <p className="text-xs text-slate-400">
                    {historicalProfile.profileTime ? new Date(historicalProfile.profileTime).toLocaleString('zh-CN') : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-glow p-4 border-l-4 border-l-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">当前状态</p>
                  <p className="text-white font-medium">{profile?.hostname || '-'}</p>
                  <p className="text-xs text-slate-400">
                    {profile?.profileTime ? new Date(profile.profileTime).toLocaleString('zh-CN') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {comparisonResult && (
            <>
              <div className="card-glow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">变更摘要</h3>
                  </div>
                  <button
                    onClick={handleCopySummary}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      copied
                        ? 'bg-success/20 text-success'
                        : 'bg-primary/20 hover:bg-primary/30 text-primary'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制到剪贴板
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {hasChanges ? (
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                      {generateChangeSummary()}
                    </pre>
                  ) : (
                    <p className="text-slate-500 text-center py-4">暂无变更内容</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="card-glow p-4 text-center border border-success/30">
                  <p className="text-2xl font-bold text-success mb-1">{comparisonResult.summary.hardwareChanges}</p>
                  <p className="text-xs text-slate-400">硬件变更</p>
                </div>
                <div className="card-glow p-4 text-center border border-success/30">
                  <p className="text-2xl font-bold text-success mb-1">{comparisonResult.summary.softwareAdded}</p>
                  <p className="text-xs text-slate-400">新增软件</p>
                </div>
                <div className="card-glow p-4 text-center border border-danger/30">
                  <p className="text-2xl font-bold text-danger mb-1">{comparisonResult.summary.softwareRemoved}</p>
                  <p className="text-xs text-slate-400">移除软件</p>
                </div>
                <div className="card-glow p-4 text-center border border-warning/30">
                  <p className="text-2xl font-bold text-warning mb-1">{comparisonResult.summary.configChanges}</p>
                  <p className="text-xs text-slate-400">配置变更</p>
                </div>
              </div>

              <div className="card-glow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-white">磁盘变更详情</h3>
                </div>
                <DiskComparison changes={comparisonResult.diskChanges} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-glow p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-success" />
                    <h3 className="text-lg font-semibold text-white">新增项目</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">
                      {comparisonResult.added.length}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    <ComparisonTable data={comparisonResult.added} type="added" />
                  </div>
                </div>

                <div className="card-glow p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Minus className="w-5 h-5 text-danger" />
                    <h3 className="text-lg font-semibold text-white">移除项目</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-danger/20 text-danger">
                      {comparisonResult.removed.length}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    <ComparisonTable data={comparisonResult.removed} type="removed" />
                  </div>
                </div>

                <div className="card-glow p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Edit3 className="w-5 h-5 text-warning" />
                    <h3 className="text-lg font-semibold text-white">变更项目</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                      {comparisonResult.changed.length}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    <ChangesTable data={comparisonResult.changed} />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

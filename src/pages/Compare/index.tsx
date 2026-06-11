import { useEffect, useCallback } from 'react';
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
  HardDrive
} from 'lucide-react';
import { SystemProfile } from '../../types';
import { formatBytes, bytesToGB } from '../../types';

function DiskComparison({ changes }: { changes: {
  added: { letter: string; label: string; total: number }[];
  removed: { letter: string; label: string; total: number }[];
  capacityChanged: { disk: string; oldTotal: number; newTotal: number; oldFree: number; newFree: number }[];
} }) {
  const { added, removed, capacityChanged } = changes;

  if (added.length === 0 && removed.length === 0 && capacityChanged.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        磁盘无变更
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {added.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-success flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增磁盘
          </h4>
          {added.map(disk => (
            <div key={disk.letter} className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
              <HardDrive className="w-5 h-5 text-success" />
              <div className="flex-1">
                <p className="text-white font-medium">{disk.letter} {disk.label}</p>
                <p className="text-sm text-slate-400">{formatBytes(disk.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {removed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-danger flex items-center gap-2">
            <Minus className="w-4 h-4" />
            移除磁盘
          </h4>
          {removed.map(disk => (
            <div key={disk.letter} className="flex items-center gap-3 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <HardDrive className="w-5 h-5 text-danger" />
              <div className="flex-1">
                <p className="text-white font-medium">{disk.letter} {disk.label}</p>
                <p className="text-sm text-slate-400">{formatBytes(disk.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {capacityChanged.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-warning flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            容量变化
          </h4>
          {capacityChanged.map(change => (
            <div key={change.disk} className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-warning" />
                <span className="text-white font-medium">{change.disk}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded p-2">
                  <p className="text-xs text-slate-500 mb-1">历史</p>
                  <p className="text-sm text-slate-300">总量: {bytesToGB(change.oldTotal).toFixed(1)} GB</p>
                  <p className="text-sm text-slate-400">可用: {bytesToGB(change.oldFree).toFixed(1)} GB</p>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                  <p className="text-xs text-slate-500 mb-1">当前</p>
                  <p className="text-sm text-slate-300">总量: {bytesToGB(change.newTotal).toFixed(1)} GB</p>
                  <p className="text-sm text-slate-400">可用: {bytesToGB(change.newFree).toFixed(1)} GB</p>
                </div>
              </div>
            </div>
          ))}
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

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

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
                  <h3 className="text-lg font-semibold text-white">磁盘变更</h3>
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

import { useAppStore } from '../../stores/appStore';
import {
  Database,
  Package,
  Rocket,
  HardDrive,
  Folder,
  Users,
  Clock,
  Download,
  RefreshCw,
  CheckCircle2,
  Circle,
  Loader2
} from 'lucide-react';
import { useEffect } from 'react';

interface CollectionItemProps {
  title: string;
  icon: React.ElementType;
  status: 'idle' | 'collecting' | 'completed' | 'error';
  onCollect: () => void;
  children?: React.ReactNode;
}

function CollectionItem({ title, icon: Icon, status, onCollect, children }: CollectionItemProps) {
  return (
    <div className="card-glow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            status === 'completed' ? 'bg-success/20' :
            status === 'collecting' ? 'bg-primary/20' :
            'bg-slate-700/50'
          }`}>
            <Icon className={`w-5 h-5 ${
              status === 'completed' ? 'text-success' :
              status === 'collecting' ? 'text-primary animate-pulse' :
              'text-slate-400'
            }`} />
          </div>
          <div>
            <h3 className="text-white font-medium">{title}</h3>
            <p className="text-xs text-slate-500">
              {status === 'idle' && '待采集'}
              {status === 'collecting' && '采集中...'}
              {status === 'completed' && '已完成'}
              {status === 'error' && '采集失败'}
            </p>
          </div>
        </div>
        <button
          onClick={onCollect}
          disabled={status === 'collecting'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            status === 'completed'
              ? 'bg-success/20 text-success hover:bg-success/30'
              : status === 'collecting'
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {status === 'collecting' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              采集中
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              已采集
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              采集
            </span>
          )}
        </button>
      </div>
      {children}
    </div>
  );
}

function DataTable({ data, columns }: { data: Record<string, unknown>[]; columns: { key: string; label: string; render?: (value: unknown) => React.ReactNode }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        暂无数据，请先采集
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            {columns.map(col => (
              <th key={col.key} className="text-left py-3 px-4 text-slate-400 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4 text-slate-300">
                  {col.render ? col.render(row[col.key]) : String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CollectPage() {
  const {
    profile,
    collectionStatus,
    collectionProgress,
    collectSoftware,
    collectStartupItems,
    collectPeripherals,
    collectShares,
    collectUsers,
    collectLoginRecords,
    collectAll
  } = useAppStore();

  useEffect(() => {
    if (!profile) {
      useAppStore.getState().loadProfile();
    }
  }, [profile]);

  const allCompleted = Object.values(collectionStatus).every(s => s === 'completed' || s === 'idle');

  const handleExport = () => {
    if (!profile) return;
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `host-profile-${profile.hostname}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">系统信息采集</h1>
          <p className="text-slate-400 text-sm mt-1">一键获取完整系统数据</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={!profile}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            导出JSON
          </button>
        </div>
      </div>

      {collectionProgress > 0 && collectionProgress < 100 && (
        <div className="card-glow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">采集进度</span>
            <span className="text-sm font-mono text-primary">{collectionProgress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${collectionProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="card-glow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              allCompleted ? 'bg-success/20' : 'bg-primary/20'
            }`}>
              <Database className={`w-6 h-6 ${allCompleted ? 'text-success' : 'text-primary'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">一键全量采集</h2>
              <p className="text-xs text-slate-400">采集所有系统信息项</p>
            </div>
          </div>
          <button
            onClick={collectAll}
            disabled={collectionProgress > 0 && collectionProgress < 100}
            className="btn-primary flex items-center gap-2"
          >
            {collectionProgress > 0 && collectionProgress < 100 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                采集中...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                开始采集
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CollectionItem
            title="安装软件"
            icon={Package}
            status={collectionStatus.software}
            onCollect={collectSoftware}
          >
            {profile?.software && (
              <div className="mt-4 max-h-60 overflow-y-auto scrollbar-thin">
                <DataTable
                  data={profile.software as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: 'name', label: '名称' },
                    { key: 'version', label: '版本' },
                    { key: 'vendor', label: '发行商', render: (v) => <span className="text-xs text-slate-500">{String(v)}</span> }
                  ]}
                />
              </div>
            )}
          </CollectionItem>

          <CollectionItem
            title="启动项"
            icon={Rocket}
            status={collectionStatus.startupItems}
            onCollect={collectStartupItems}
          >
            {profile?.startupItems && (
              <div className="mt-4 max-h-60 overflow-y-auto scrollbar-thin">
                <DataTable
                  data={profile.startupItems as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: 'name', label: '名称' },
                    { key: 'publisher', label: '发布者', render: (v) => (
                      <span className={`text-xs ${v === 'Unknown' ? 'text-warning' : 'text-slate-500'}`}>
                        {String(v)}
                      </span>
                    )},
                    {
                      key: 'signed', label: '签名', render: (v) => (
                        <span className={`px-2 py-0.5 text-xs rounded ${v ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                          {v ? '已签名' : '未签名'}
                        </span>
                      )
                    },
                    {
                      key: 'enabled', label: '状态', render: (v) => (
                        <span className={`px-2 py-0.5 text-xs rounded ${v ? 'bg-primary/20 text-primary' : 'bg-slate-600/50 text-slate-400'}`}>
                          {v ? '启用' : '禁用'}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </CollectionItem>

          <CollectionItem
            title="外设信息"
            icon={HardDrive}
            status={collectionStatus.peripherals}
            onCollect={collectPeripherals}
          >
            {profile?.peripherals && (
              <div className="mt-4 max-h-60 overflow-y-auto scrollbar-thin">
                <DataTable
                  data={profile.peripherals as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: 'name', label: '设备名称' },
                    { key: 'type', label: '类型', render: (v) => <span className="capitalize">{String(v)}</span> },
                    {
                      key: 'status', label: '状态', render: (v) => (
                        <span className={`flex items-center gap-1 ${v === 'connected' ? 'text-success' : 'text-slate-500'}`}>
                          <Circle className="w-2 h-2 fill-current" />
                          {v === 'connected' ? '已连接' : '已断开'}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </CollectionItem>
        </div>

        <div className="space-y-6">
          <CollectionItem
            title="共享目录"
            icon={Folder}
            status={collectionStatus.shares}
            onCollect={collectShares}
          >
            {profile?.shares && (
              <div className="mt-4 max-h-60 overflow-y-auto scrollbar-thin">
                <DataTable
                  data={profile.shares as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: 'name', label: '共享名' },
                    { key: 'path', label: '路径', render: (v) => <span className="text-xs text-slate-500 font-mono">{String(v)}</span> },
                    { key: 'connectedUsers', label: '连接数' }
                  ]}
                />
              </div>
            )}
          </CollectionItem>

          <CollectionItem
            title="账户列表"
            icon={Users}
            status={collectionStatus.users}
            onCollect={collectUsers}
          >
            {profile?.users && (
              <div className="mt-4 max-h-60 overflow-y-auto scrollbar-thin">
                <DataTable
                  data={profile.users as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: 'username', label: '用户名' },
                    {
                      key: 'type', label: '类型', render: (v) => (
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          v === 'admin' ? 'bg-danger/20 text-danger' :
                          v === 'guest' ? 'bg-slate-600/50 text-slate-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {v === 'admin' ? '管理员' : v === 'guest' ? '来宾' : '标准'}
                        </span>
                      )
                    },
                    {
                      key: 'disabled', label: '状态', render: (v) => (
                        <span className={`px-2 py-0.5 text-xs rounded ${v ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                          {v ? '已禁用' : '正常'}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </CollectionItem>

          <CollectionItem
            title="登录记录"
            icon={Clock}
            status={collectionStatus.loginRecords}
            onCollect={collectLoginRecords}
          >
            {profile?.loginRecords && (
              <div className="mt-4 max-h-60 overflow-y-auto scrollbar-thin">
                <DataTable
                  data={profile.loginRecords as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: 'time', label: '时间' },
                    { key: 'username', label: '账户' },
                    { key: 'source', label: '来源', render: (v) => <span className="text-xs text-slate-500">{String(v)}</span> },
                    {
                      key: 'type', label: '类型', render: (v) => (
                        <span className={`px-2 py-0.5 text-xs rounded ${v === 'domain' ? 'bg-primary/20 text-primary' : 'bg-slate-600/50 text-slate-400'}`}>
                          {v === 'domain' ? '域登录' : '本地'}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </CollectionItem>
        </div>
      </div>
    </div>
  );
}

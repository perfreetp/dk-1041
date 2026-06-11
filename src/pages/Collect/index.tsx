import { useEffect, useCallback, useRef, useState } from 'react';
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
  Loader2,
  AlertTriangle,
  AlertOctagon,
  Upload,
  MonitorCheck,
  Monitor,
  FileJson
} from 'lucide-react';
import { getDataSourceLabel, getDataSourceDescription, SystemProfile } from '../../types';

type CollectionStatusType = 'idle' | 'collecting' | 'completed' | 'error' | 'unsupported';

interface CollectionItemProps {
  title: string;
  icon: React.ElementType;
  status: CollectionStatusType;
  onCollect: () => void;
  children?: React.ReactNode;
}

function CollectionItem({ title, icon: Icon, status, onCollect, children }: CollectionItemProps) {
  const getStatusText = (s: CollectionStatusType) => {
    switch (s) {
      case 'idle': return '待采集';
      case 'collecting': return '采集中...';
      case 'completed': return '已完成';
      case 'error': return '采集失败';
      case 'unsupported': return '环境不支持';
      default: return '待采集';
    }
  };

  const getIconColor = (s: CollectionStatusType) => {
    switch (s) {
      case 'completed': return 'text-success';
      case 'collecting': return 'text-primary animate-pulse';
      case 'unsupported': return 'text-warning';
      case 'error': return 'text-danger';
      default: return 'text-slate-400';
    }
  };

  const getBgColor = (s: CollectionStatusType) => {
    switch (s) {
      case 'completed': return 'bg-success/20';
      case 'collecting': return 'bg-primary/20';
      case 'unsupported': return 'bg-warning/20';
      case 'error': return 'bg-danger/20';
      default: return 'bg-slate-700/50';
    }
  };

  return (
    <div className={`card-glow p-6 ${status === 'unsupported' ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getBgColor(status)}`}>
            <Icon className={`w-5 h-5 ${getIconColor(status)}`} />
          </div>
          <div>
            <h3 className="text-white font-medium">{title}</h3>
            <p className="text-xs text-slate-500">
              {getStatusText(status)}
            </p>
          </div>
        </div>
        <button
          onClick={onCollect}
          disabled={status === 'collecting' || status === 'unsupported'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            status === 'completed'
              ? 'bg-success/20 text-success hover:bg-success/30'
              : status === 'collecting'
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : status === 'unsupported'
              ? 'bg-warning/20 text-warning cursor-not-allowed'
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
          ) : status === 'unsupported' ? (
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              不支持
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
        暂无数据
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
    collectAll,
    dataSource,
    switchToDemo,
    switchToDesktop,
    importProfile,
    exportCurrentProfile,
    isDesktopSupported
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ type: 'profile' | 'report'; data: unknown } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      useAppStore.getState().loadProfile();
    }
  }, [profile]);

  const validateProfile = (data: unknown): { valid: boolean; profile?: SystemProfile; error?: string } => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '文件格式不正确，请选择有效的 JSON 文件' };
    }

    const obj = data as Record<string, unknown>;

    if (!obj.hostname || typeof obj.hostname !== 'string') {
      return { valid: false, error: '缺少主机名信息，文件不符合主机画像格式' };
    }

    if (!obj.os || typeof obj.os !== 'object') {
      return { valid: false, error: '缺少系统信息，文件不符合主机画像格式' };
    }

    return { valid: true, profile: data as SystemProfile };
  };

  const validateReport = (data: unknown): { valid: boolean; profile?: SystemProfile; reportConfig?: Partial<import('../../types').ReportConfig>; error?: string } => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '文件格式不正确，请选择有效的 JSON 文件' };
    }

    const obj = data as Record<string, unknown>;

    if (!obj.systemProfile) {
      return { valid: false, error: '缺少系统画像数据，文件不符合维护报告格式' };
    }

    const profileValidation = validateProfile(obj.systemProfile);
    if (!profileValidation.valid) {
      return { valid: false, error: `文件不符合维护报告格式：${profileValidation.error}` };
    }

    const reportConfig = obj.reportConfig as Record<string, unknown> | undefined;

    return {
      valid: true,
      profile: obj.systemProfile as SystemProfile,
      reportConfig: reportConfig ? {
        template: reportConfig.template as import('../../types').ReportTemplate,
        modules: reportConfig.modules as import('../../types').ReportModule[],
        engineer: reportConfig.engineer as string,
        processStatus: reportConfig.processStatus as 'pending' | 'processing' | 'completed',
        notes: reportConfig.notes as string,
        includeRisks: reportConfig.includeRisks as boolean,
        includeSuggestions: reportConfig.includeSuggestions as boolean,
        includeNotes: reportConfig.includeNotes as boolean
      } : undefined
    };
  };

  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data._type === 'host-profile-report' && data.systemProfile) {
          const validation = validateReport(data);
          if (!validation.valid) {
            setImportError(validation.error || '文件格式不正确');
            return;
          }
          setPendingImport({ type: 'report', data: validation });
        } else {
          const validation = validateProfile(data);
          if (!validation.valid) {
            setImportError(validation.error || '文件格式不正确');
            return;
          }
          setPendingImport({ type: 'profile', data: validation.profile });
        }
        setShowImportConfirm(true);
      } catch {
        setImportError('文件格式不正确，无法解析 JSON 内容');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  const confirmImport = () => {
    if (!pendingImport) return;

    if (pendingImport.type === 'report') {
      const validation = pendingImport.data as { profile?: SystemProfile; reportConfig?: Partial<import('../../types').ReportConfig> };
      if (validation.profile) {
        const { importReport } = useAppStore.getState();
        importReport({
          systemProfile: validation.profile,
          reportConfig: validation.reportConfig
        });
      }
    } else {
      const profile = pendingImport.data as SystemProfile;
      importProfile(profile);
    }

    setShowImportConfirm(false);
    setPendingImport(null);
    setImportError(null);
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingImport(null);
    setImportError(null);
  };

  const allCompleted = Object.values(collectionStatus).every(s => s === 'completed' || s === 'idle');
  const anyUnsupported = Object.values(collectionStatus).some(s => s === 'unsupported');
  const isDemo = dataSource === 'demo';
  const desktopSupported = isDesktopSupported();

  const SourceIcon = dataSource === 'desktop' ? MonitorCheck : dataSource === 'imported' ? Upload : Database;
  const sourceColor = dataSource === 'desktop' ? 'success' : dataSource === 'imported' ? 'primary' : 'warning';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">系统信息采集</h1>
          <p className="text-slate-400 text-sm mt-1">一键获取完整系统数据</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${sourceColor}/10 border border-${sourceColor}/30`}>
            <SourceIcon className={`w-4 h-4 text-${sourceColor}`} />
            <span className={`text-sm text-${sourceColor}`}>{getDataSourceLabel(dataSource)}</span>
          </div>
          <button
            onClick={exportCurrentProfile}
            disabled={!profile}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            导出JSON
          </button>
        </div>
      </div>

      <div className="card-glow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">选择数据来源</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={switchToDemo}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              dataSource === 'demo'
                ? 'border-warning bg-warning/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dataSource === 'demo' ? 'bg-warning/20' : 'bg-slate-700'
              }`}>
                <Database className={`w-5 h-5 ${dataSource === 'demo' ? 'text-warning' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-white font-medium">浏览器演示</p>
                <p className="text-xs text-slate-500">查看示例数据</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              在浏览器环境中查看模拟的主机画像数据，适合功能演示
            </p>
          </button>

          <button
            onClick={switchToDesktop}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              !desktopSupported
                ? 'border-slate-700/50 bg-slate-800/30 cursor-not-allowed opacity-60'
                : dataSource === 'desktop'
                ? 'border-success bg-success/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                !desktopSupported ? 'bg-slate-700/50' : dataSource === 'desktop' ? 'bg-success/20' : 'bg-slate-700'
              }`}>
                <MonitorCheck className={`w-5 h-5 ${!desktopSupported ? 'text-slate-500' : dataSource === 'desktop' ? 'text-success' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-white font-medium">桌面采集</p>
                <p className="text-xs text-slate-500">
                  {!desktopSupported ? '环境不支持' : '实时采集本机数据'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {!desktopSupported
                ? '当前运行环境为浏览器，请使用桌面应用进行真实数据采集'
                : '采集当前电脑的系统信息，包括硬件、软件和外设等完整数据'}
            </p>
          </button>

          <label
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              dataSource === 'imported'
                ? 'border-primary bg-primary/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dataSource === 'imported' ? 'bg-primary/20' : 'bg-slate-700'
              }`}>
                <Upload className={`w-5 h-5 ${dataSource === 'imported' ? 'text-primary' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-white font-medium">导入档案</p>
                <p className="text-xs text-slate-500">导入历史JSON档案</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              导入之前保存的主机画像档案，可用于对比分析
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showImportConfirm && pendingImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-glow p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileJson className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {pendingImport.type === 'report' ? '导入维护报告' : '确认导入档案'}
                </h3>
                <p className="text-sm text-slate-400">
                  {pendingImport.type === 'report' ? '将恢复报告配置和画像数据' : '将使用导入的档案作为当前画像'}
                </p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">计算机名</p>
                  <p className="text-white font-mono">
                    {(pendingImport.type === 'report'
                      ? (pendingImport.data as { profile?: SystemProfile }).profile?.hostname
                      : (pendingImport.data as SystemProfile).hostname) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">操作系统</p>
                  <p className="text-white">
                    {(pendingImport.type === 'report'
                      ? (pendingImport.data as { profile?: SystemProfile }).profile?.os?.name
                      : (pendingImport.data as SystemProfile).os?.name) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">采集时间</p>
                  <p className="text-white">
                    {(() => {
                      const profile = pendingImport.type === 'report'
                        ? (pendingImport.data as { profile?: SystemProfile }).profile
                        : (pendingImport.data as SystemProfile);
                      return profile?.profileTime ? new Date(profile.profileTime).toLocaleString('zh-CN') : '-';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">数据来源</p>
                  <p className="text-white">{getDataSourceLabel('imported')}</p>
                </div>
                {pendingImport.type === 'report' && (pendingImport.data as { reportConfig?: Partial<import('../../types').ReportConfig> }).reportConfig && (
                  <>
                    <div>
                      <p className="text-slate-500">工程师</p>
                      <p className="text-white">{(pendingImport.data as { reportConfig?: { engineer?: string } }).reportConfig?.engineer || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">处理状态</p>
                      <p className="text-white">
                        {((pendingImport.data as { reportConfig?: { processStatus?: string } }).reportConfig?.processStatus || 'pending') === 'completed' ? '已完成' :
                         ((pendingImport.data as { reportConfig?: { processStatus?: string } }).reportConfig?.processStatus || 'pending') === 'processing' ? '处理中' : '待处理'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {pendingImport.type === 'report' && (pendingImport.data as { reportConfig?: Partial<import('../../types').ReportConfig> }).reportConfig && (
              <p className="text-sm text-primary mb-4">
                ✓ 此文件包含完整的报告配置（工程师、状态、备注等）
              </p>
            )}
            <p className="text-sm text-slate-400 mb-4">
              导入后，当前页面、首页、风险页和报告页将同步显示此档案的数据。是否确认导入？
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelImport}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 btn-primary"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <div className="card-glow p-4 border border-danger/30 bg-danger/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-danger flex-shrink-0" />
              <div>
                <p className="text-danger font-medium">导入失败</p>
                <p className="text-sm text-slate-400 mt-1">{importError}</p>
              </div>
            </div>
            <button
              onClick={() => setImportError(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {isDemo && (
        <div className="card-glow p-4 border border-danger/30 bg-danger/10">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-danger flex-shrink-0" />
            <div>
              <p className="text-danger font-medium">浏览器环境限制</p>
              <p className="text-sm text-slate-400 mt-1">
                {getDataSourceDescription(dataSource)}
              </p>
            </div>
          </div>
        </div>
      )}

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
              anyUnsupported ? 'bg-warning/20' : allCompleted ? 'bg-success/20' : 'bg-primary/20'
            }`}>
              <Database className={`w-6 h-6 ${anyUnsupported ? 'text-warning' : allCompleted ? 'text-success' : 'text-primary'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">一键全量采集</h2>
              <p className="text-xs text-slate-400">采集所有系统信息项</p>
            </div>
          </div>
          <button
            onClick={collectAll}
            disabled={collectionProgress > 0 && collectionProgress < 100 || isDemo}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDemo ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                环境不支持
              </>
            ) : collectionProgress > 0 && collectionProgress < 100 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                采集中...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
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

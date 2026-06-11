import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  FileText,
  Save,
  Printer,
  Download,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  User,
  Calendar,
  Monitor,
  MessageSquare,
  Settings,
  CheckSquare,
  Square,
  ShieldAlert,
  Package,
  Cpu
} from 'lucide-react';
import { formatBytes, getDataSourceLabel, getDataSourceDescription, ReportTemplate, ReportModule } from '../../types';

const templateOptions: { value: ReportTemplate; label: string; description: string }[] = [
  { value: 'simple', label: '简洁模板', description: '仅包含基本信息和高危风险' },
  { value: 'standard', label: '标准模板', description: '包含完整信息和风险建议' },
  { value: 'detailed', label: '详细模板', description: '包含所有详细信息和完整建议' }
];

const moduleOptions: { value: ReportModule; label: string; icon: React.ReactNode }[] = [
  { value: 'system', label: '系统信息', icon: <Monitor className="w-4 h-4" /> },
  { value: 'hardware', label: '硬件信息', icon: <Cpu className="w-4 h-4" /> },
  { value: 'software', label: '软件列表', icon: <Package className="w-4 h-4" /> },
  { value: 'risks', label: '风险项', icon: <ShieldAlert className="w-4 h-4" /> },
  { value: 'suggestions', label: '维护建议', icon: <Wrench className="w-4 h-4" /> },
  { value: 'notes', label: '现场备注', icon: <MessageSquare className="w-4 h-4" /> }
];

export default function ReportPage() {
  const {
    profile,
    risks,
    maintenanceSuggestions,
    reportConfig,
    updateReportConfig,
    setReportNotes,
    loadProfile,
    dataSource
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const handleSaveReport = () => {
    if (!profile) return;

    const reportData = {
      reportInfo: {
        generatedAt: new Date().toISOString(),
        engineer: reportConfig.engineer,
        hostname: profile.hostname,
        processStatus: reportConfig.processStatus,
        dataSource: profile.dataSource,
        dataSourceLabel: getDataSourceLabel(profile.dataSource),
        template: reportConfig.template,
        modules: reportConfig.modules
      },
      systemProfile: profile,
      risks: reportConfig.modules.includes('risks') ? risks : [],
      suggestions: reportConfig.modules.includes('suggestions') ? maintenanceSuggestions : [],
      notes: reportConfig.notes,
      reportConfig: reportConfig
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance-report-${profile.hostname}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleModule = (module: ReportModule) => {
    const newModules = reportConfig.modules.includes(module)
      ? reportConfig.modules.filter(m => m !== module)
      : [...reportConfig.modules, module];
    updateReportConfig({ modules: newModules });
  };

  const highRisks = risks.filter(r => r.severity === 'high');
  const mediumRisks = risks.filter(r => r.severity === 'medium');
  const lowRisks = risks.filter(r => r.severity === 'low');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-white">维护报告</h1>
          <p className="text-slate-400 text-sm mt-1">生成并导出维护交付文档</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showSettings ? 'bg-primary text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            报告设置
          </button>
          <button
            onClick={handleSaveReport}
            disabled={!profile}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            保存档案
          </button>
          <button
            onClick={handlePrint}
            disabled={!profile}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            打印交付单
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="card-glow p-6 no-print">
          <h3 className="text-lg font-semibold text-white mb-4">报告设置</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">报告模板</label>
              <div className="space-y-2">
                {templateOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      reportConfig.template === opt.value
                        ? 'bg-primary/20 border border-primary/30'
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={opt.value}
                      checked={reportConfig.template === opt.value}
                      onChange={() => updateReportConfig({ template: opt.value })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reportConfig.template === opt.value ? 'border-primary' : 'border-slate-600'
                    }`}>
                      {reportConfig.template === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">包含模块</label>
              <div className="grid grid-cols-2 gap-2">
                {moduleOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      reportConfig.modules.includes(opt.value)
                        ? 'bg-primary/20 border border-primary/30 text-primary'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <button
                      onClick={() => toggleModule(opt.value)}
                      className="sr-only"
                    >
                      {opt.label}
                    </button>
                    {reportConfig.modules.includes(opt.value) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glow p-6 print:border print:border-slate-300">
            <div className="flex items-center justify-between mb-6 no-print">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {templateOptions.find(t => t.value === reportConfig.template)?.label || '标准'}维护报告
                  </h2>
                  <p className="text-xs text-slate-400">系统诊断与维护建议</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">报告编号</p>
                <p className="text-sm text-slate-300 font-mono">RPT-{Date.now().toString().slice(-8)}</p>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  dataSource === 'desktop' ? 'bg-success/20 text-success' :
                  dataSource === 'imported' ? 'bg-primary/20 text-primary' :
                  'bg-warning/20 text-warning'
                }`}>
                  {getDataSourceLabel(dataSource)}
                </span>
                <span className="text-xs text-slate-500">{getDataSourceDescription(dataSource)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Monitor className="w-4 h-4" />
                    <span className="text-xs">设备信息</span>
                  </div>
                  <p className="text-white font-medium">{profile?.hostname || '-'}</p>
                  <p className="text-sm text-slate-400">{profile?.os.name || '-'}</p>
                  <p className="text-xs text-slate-500">{profile?.os.version || '-'} (Build {profile?.os.build || '-'})</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">报告时间</span>
                  </div>
                  <p className="text-white font-medium">{new Date().toLocaleDateString('zh-CN')}</p>
                  <p className="text-sm text-slate-400">{new Date().toLocaleTimeString('zh-CN')}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs">维护工程师</span>
                </div>
                <input
                  type="text"
                  value={reportConfig.engineer}
                  onChange={(e) => updateReportConfig({ engineer: e.target.value })}
                  className="w-full bg-transparent text-white font-medium border-b border-slate-600 focus:border-primary outline-none py-1 no-print"
                  placeholder="请输入维护人员姓名"
                />
                <p className="text-white font-medium print:block hidden">{reportConfig.engineer}</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs">处理状态</span>
                </div>
                <div className="flex gap-3 no-print">
                  {(['pending', 'processing', 'completed'] as const).map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="processStatus"
                        checked={reportConfig.processStatus === status}
                        onChange={() => updateReportConfig({ processStatus: status })}
                        className="sr-only"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        reportConfig.processStatus === status
                          ? status === 'pending' ? 'bg-warning/20 text-warning border border-warning/30' :
                            status === 'processing' ? 'bg-primary/20 text-primary border border-primary/30' :
                            'bg-success/20 text-success border border-success/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {status === 'pending' ? '待处理' : status === 'processing' ? '处理中' : '已完成'}
                      </span>
                    </label>
                  ))}
                </div>
                <p className={`font-medium print:block hidden ${
                  reportConfig.processStatus === 'completed' ? 'text-success' :
                  reportConfig.processStatus === 'processing' ? 'text-primary' : 'text-warning'
                }`}>
                  {reportConfig.processStatus === 'pending' ? '待处理' :
                   reportConfig.processStatus === 'processing' ? '处理中' : '已完成'}
                </p>
              </div>
            </div>
          </div>

          {reportConfig.modules.includes('system') && (
            <div className="card-glow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">系统信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">计算机名</p>
                  <p className="text-white font-mono">{profile?.hostname}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">操作系统</p>
                  <p className="text-white">{profile?.os.name}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">CPU</p>
                  <p className="text-white text-sm">{profile?.cpu.model}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">内存</p>
                  <p className="text-white">{profile ? formatBytes(profile.memory.total) : '-'}</p>
                </div>
              </div>
            </div>
          )}

          {reportConfig.modules.includes('hardware') && (
            <div className="card-glow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">硬件信息</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">磁盘状态</p>
                  <div className="space-y-2">
                    {profile?.disks.map(disk => {
                      const usedPercent = (disk.used / disk.total) * 100;
                      return (
                        <div key={disk.letter} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white">{disk.letter} {disk.label}</span>
                            <span className="text-slate-400">{formatBytes(disk.free)} / {formatBytes(disk.total)}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usedPercent > 90 ? 'bg-danger' : usedPercent > 80 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${usedPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportConfig.modules.includes('risks') && risks.length > 0 && (
            <div className="card-glow p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-white">风险项清单</h3>
                <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                  {risks.length} 项
                </span>
              </div>

              {highRisks.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-danger mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    高危风险（需立即处理）
                  </p>
                  <div className="space-y-2">
                    {highRisks.map(risk => (
                      <div key={risk.id} className="p-4 rounded-lg bg-danger/10 border border-danger/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{risk.title}</span>
                        </div>
                        <p className="text-sm text-slate-400">{risk.description}</p>
                        <div className="mt-2 flex items-start gap-2 text-sm">
                          <Wrench className="w-4 h-4 text-slate-500 mt-0.5" />
                          <p className="text-slate-300">{risk.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mediumRisks.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    中危风险（建议处理）
                  </p>
                  <div className="space-y-2">
                    {mediumRisks.map(risk => (
                      <div key={risk.id} className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{risk.title}</span>
                        </div>
                        <p className="text-sm text-slate-400">{risk.description}</p>
                        <div className="mt-2 flex items-start gap-2 text-sm">
                          <Wrench className="w-4 h-4 text-slate-500 mt-0.5" />
                          <p className="text-slate-300">{risk.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lowRisks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    低危风险（可择机处理）
                  </p>
                  <div className="space-y-2">
                    {lowRisks.map(risk => (
                      <div key={risk.id} className="p-4 rounded-lg bg-success/10 border border-success/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{risk.title}</span>
                        </div>
                        <p className="text-sm text-slate-400">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {reportConfig.modules.includes('suggestions') && maintenanceSuggestions.length > 0 && (
            <div className="card-glow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-white">维护建议</h3>
              </div>
              <div className="space-y-2">
                {maintenanceSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-slate-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportConfig.modules.includes('notes') && (
            <div className="card-glow p-6">
              <div className="flex items-center justify-between mb-4 no-print">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-white">现场备注</h3>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  {isEditing ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      完成编辑
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      编辑备注
                    </>
                  )}
                </button>
              </div>
              {isEditing ? (
                <textarea
                  value={reportConfig.notes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="请在此处填写现场维护备注..."
                  className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300 resize-none focus:border-primary outline-none"
                />
              ) : (
                <div className="min-h-[100px] bg-slate-800/50 rounded-lg p-4">
                  {reportConfig.notes ? (
                    <p className="text-slate-300 whitespace-pre-wrap">{reportConfig.notes}</p>
                  ) : (
                    <p className="text-slate-500 italic">暂无备注内容</p>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2 no-print">备注内容将包含在最终报告中</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-glow p-6">
            <h3 className="text-lg font-semibold text-white mb-4">报告操作</h3>
            <div className="space-y-3">
              <button
                onClick={handleSaveReport}
                disabled={!profile}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                导出JSON档案
              </button>
              <button
                onClick={handlePrint}
                disabled={!profile}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                打印交付单
              </button>
            </div>
          </div>

          <div className="card-glow p-6">
            <h3 className="text-lg font-semibold text-white mb-4">系统摘要</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">软件数量</span>
                <span className="text-white font-mono">{profile?.software.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">启动项</span>
                <span className="text-white font-mono">{profile?.startupItems.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">共享目录</span>
                <span className="text-white font-mono">{profile?.shares.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-slate-400">用户账户</span>
                <span className="text-white font-mono">{profile?.users.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">风险项</span>
                <span className={`font-mono ${highRisks.length > 0 ? 'text-danger' : 'text-success'}`}>
                  {risks.length}
                </span>
              </div>
            </div>
          </div>

          <div className="card-glow p-6">
            <h3 className="text-lg font-semibold text-white mb-4">风险统计</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="w-4 h-4" />
                  高危
                </span>
                <span className="text-danger font-mono">{highRisks.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  中危
                </span>
                <span className="text-warning font-mono">{mediumRisks.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-success">
                  <AlertTriangle className="w-4 h-4" />
                  低危
                </span>
                <span className="text-success font-mono">{lowRisks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

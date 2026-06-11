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
  MessageSquare
} from 'lucide-react';

export default function ReportPage() {
  const {
    profile,
    risks,
    maintenanceSuggestions,
    reportNotes,
    setReportNotes,
    loadProfile
  } = useAppStore();

  const [engineerName, setEngineerName] = useState('维护工程师');
  const [isEditing, setIsEditing] = useState(false);

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
        engineer: engineerName,
        hostname: profile.hostname
      },
      systemProfile: profile,
      risks: risks,
      suggestions: maintenanceSuggestions,
      notes: reportNotes
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-white">维护报告</h1>
          <p className="text-slate-400 text-sm mt-1">生成并导出维护交付文档</p>
        </div>
        <div className="flex items-center gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glow p-6 print:border print:border-slate-300">
            <div className="flex items-center justify-between mb-6 no-print">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">设备维护报告</h2>
                  <p className="text-xs text-slate-400">系统诊断与维护建议</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">报告编号</p>
                <p className="text-sm text-slate-300 font-mono">RPT-{Date.now().toString().slice(-8)}</p>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-6">
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
                  <span className="text-xs">维护人员</span>
                </div>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full bg-transparent text-white font-medium border-b border-slate-600 focus:border-primary outline-none py-1 no-print"
                  placeholder="请输入维护人员姓名"
                />
                <p className="text-white font-medium print:block hidden">{engineerName}</p>
              </div>
            </div>
          </div>

          <div className="card-glow p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-white">风险项清单</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                {risks.length} 项
              </span>
            </div>
            {risks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success" />
                <p>未检测到风险项</p>
              </div>
            ) : (
              <div className="space-y-3">
                {risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`p-4 rounded-lg border ${
                      risk.severity === 'high' ? 'bg-danger/10 border-danger/30' :
                      risk.severity === 'medium' ? 'bg-warning/10 border-warning/30' :
                      'bg-success/10 border-success/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        risk.severity === 'high' ? 'status-high' :
                        risk.severity === 'medium' ? 'status-medium' : 'status-low'
                      }`}>
                        {risk.severity === 'high' ? '高危' : risk.severity === 'medium' ? '中危' : '低危'}
                      </span>
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
            )}
          </div>

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
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="请在此处填写现场维护备注..."
                className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300 resize-none focus:border-primary outline-none"
              />
            ) : (
              <div className="min-h-[100px] bg-slate-800/50 rounded-lg p-4">
                {reportNotes ? (
                  <p className="text-slate-300 whitespace-pre-wrap">{reportNotes}</p>
                ) : (
                  <p className="text-slate-500 italic">暂无备注内容</p>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2 no-print">备注内容将包含在最终报告中</p>
          </div>
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
                <span className={`font-mono ${risks.filter(r => r.severity === 'high').length > 0 ? 'text-danger' : 'text-success'}`}>
                  {risks.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:border { border-width: 1px !important; border-color: #cbd5e1 !important; }
          .print\\:border-slate-300 { border-color: #cbd5e1 !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}

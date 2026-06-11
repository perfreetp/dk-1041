import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  HardDrive,
  Rocket,
  Package,
  Folder,
  ChevronRight,
  Wrench,
  LucideIcon
} from 'lucide-react';
import { RiskItem } from '../../types';

function RiskCard({ risk }: { risk: RiskItem }) {
  const Icon: LucideIcon = risk.severity === 'high' ? AlertTriangle :
               risk.severity === 'medium' ? AlertCircle : Info;
  const TypeIcon: LucideIcon = risk.type === 'disk-space' ? HardDrive :
                   risk.type === 'startup' ? Rocket :
                   risk.type === 'outdated-software' ? Package :
                   Folder;

  return (
    <div className={`card-glow p-5 border-l-4 ${
      risk.severity === 'high' ? 'border-l-danger' :
      risk.severity === 'medium' ? 'border-l-warning' : 'border-l-success'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          risk.severity === 'high' ? 'bg-danger/20' :
          risk.severity === 'medium' ? 'bg-warning/20' : 'bg-success/20'
        }`}>
          <Icon className={`w-5 h-5 ${
            risk.severity === 'high' ? 'text-danger' :
            risk.severity === 'medium' ? 'text-warning' : 'text-success'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              risk.severity === 'high' ? 'status-high' :
              risk.severity === 'medium' ? 'status-medium' : 'status-low'
            }`}>
              {risk.severity === 'high' ? '高危' : risk.severity === 'medium' ? '中危' : '低危'}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <TypeIcon className="w-3 h-3" />
              {risk.type === 'disk-space' ? '磁盘空间' :
               risk.type === 'startup' ? '启动项' :
               risk.type === 'outdated-software' ? '软件更新' : '网络共享'}
            </span>
          </div>
          <h3 className="text-white font-medium mb-2">{risk.title}</h3>
          <p className="text-sm text-slate-400 mb-3">{risk.description}</p>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Wrench className="w-3 h-3" />
              修复建议
            </div>
            <p className="text-sm text-slate-300">{risk.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeverityStats({ risks }: { risks: RiskItem[] }) {
  const highCount = risks.filter(r => r.severity === 'high').length;
  const mediumCount = risks.filter(r => r.severity === 'medium').length;
  const lowCount = risks.filter(r => r.severity === 'low').length;
  const total = risks.length;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="card-glow p-4 text-center">
        <p className="text-3xl font-bold text-white mb-1">{total}</p>
        <p className="text-xs text-slate-400">风险总数</p>
      </div>
      <div className="card-glow p-4 text-center border border-danger/30">
        <p className="text-3xl font-bold text-danger mb-1">{highCount}</p>
        <p className="text-xs text-slate-400">高危</p>
      </div>
      <div className="card-glow p-4 text-center border border-warning/30">
        <p className="text-3xl font-bold text-warning mb-1">{mediumCount}</p>
        <p className="text-xs text-slate-400">中危</p>
      </div>
      <div className="card-glow p-4 text-center border border-success/30">
        <p className="text-3xl font-bold text-success mb-1">{lowCount}</p>
        <p className="text-xs text-slate-400">低危</p>
      </div>
    </div>
  );
}

function QuickFixPanel() {
  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-white mb-4">快速修复操作</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">清理磁盘</p>
              <p className="text-xs text-slate-500">删除临时文件</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
        <button className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-warning" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">优化启动项</p>
              <p className="text-xs text-slate-500">禁用可疑启动项</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
        <button className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">更新软件</p>
              <p className="text-xs text-slate-500">检查可用更新</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
        <button className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Folder className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">检查共享</p>
              <p className="text-xs text-slate-500">审核共享权限</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}

export default function RiskPage() {
  const { profile, risks, loadProfile } = useAppStore();

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const groupedRisks = {
    high: risks.filter(r => r.severity === 'high'),
    medium: risks.filter(r => r.severity === 'medium'),
    low: risks.filter(r => r.severity === 'low')
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">风险诊断</h1>
          <p className="text-slate-400 text-sm mt-1">系统健康检查与风险评估</p>
        </div>
        {risks.length > 0 && (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-danger" />
            <span className="text-danger font-medium">检测到 {risks.length} 项风险</span>
          </div>
        )}
      </div>

      <SeverityStats risks={risks} />

      {risks.length === 0 ? (
        <div className="card-glow p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">系统状态良好</h2>
          <p className="text-slate-400">未检测到明显风险项，建议保持定期维护</p>
        </div>
      ) : (
        <>
          {groupedRisks.high.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-danger flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                高危风险（需立即处理）
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupedRisks.high.map(risk => (
                  <RiskCard key={risk.id} risk={risk} />
                ))}
              </div>
            </div>
          )}

          {groupedRisks.medium.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warning flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                中危风险（建议处理）
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupedRisks.medium.map(risk => (
                  <RiskCard key={risk.id} risk={risk} />
                ))}
              </div>
            </div>
          )}

          {groupedRisks.low.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-success flex items-center gap-2">
                <Info className="w-5 h-5" />
                低危风险（可择机处理）
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupedRisks.low.map(risk => (
                  <RiskCard key={risk.id} risk={risk} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <QuickFixPanel />
    </div>
  );
}

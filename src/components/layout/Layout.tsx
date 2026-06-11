import { Outlet, NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import {
  Monitor,
  Database,
  ShieldAlert,
  GitCompare,
  FileText,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', icon: Monitor, label: '首页' },
  { path: '/collect', icon: Database, label: '采集' },
  { path: '/risks', icon: ShieldAlert, label: '风险' },
  { path: '/compare', icon: GitCompare, label: '对比' },
  { path: '/report', icon: FileText, label: '报告' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { lastUpdate, risks } = useAppStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const highRiskCount = risks.filter(r => r.severity === 'high').length;

  return (
    <div className="min-h-screen flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-dark/80 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 flex flex-col no-print`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="text-sm font-bold text-white">主机画像仪</h1>
                <p className="text-xs text-slate-400">系统诊断工具</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {item.path === '/risks' && highRiskCount > 0 && sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-danger/20 text-danger">
                  {highRiskCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {sidebarOpen && lastUpdate && (
          <div className="px-4 py-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">最后更新</p>
            <p className="text-sm text-slate-300 font-mono">{lastUpdate}</p>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark/50 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6 no-print">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-sm text-slate-400">系统正常</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          <Outlet />
        </main>

        <footer className="h-10 bg-dark/50 border-t border-slate-700/50 flex items-center justify-center px-6 no-print">
          <p className="text-xs text-slate-500">
            桌面主机画像仪 v1.0 | 专为电脑维护人员设计
          </p>
        </footer>
      </div>
    </div>
  );
}

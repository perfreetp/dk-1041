import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Server,
  MemoryStick,
  Activity,
  CircleDollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export default function HomePage() {
  const { profile, isLoading, loadProfile } = useAppStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">正在加载主机信息...</p>
        </div>
      </div>
    );
  }

  const diskData = profile.disks.map(disk => ({
    name: disk.letter,
    used: disk.used / 1024 / 1024,
    free: disk.free / 1024 / 1024,
    total: disk.total / 1024 / 1024
  }));

  const memoryPercent = (profile.memory.used / profile.memory.total) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">主机概览</h1>
          <p className="text-slate-400 text-sm mt-1">实时监控系统状态</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>最后采集：{profile.profileTime ? new Date(profile.profileTime).toLocaleString('zh-CN') : '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">主机标识</h2>
                <p className="text-xs text-slate-400">基本系统信息</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">计算机名</p>
                <p className="text-white font-mono font-medium">{profile.hostname}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">操作系统</p>
                <p className="text-white font-medium">{profile.os.name}</p>
                <p className="text-xs text-slate-400">版本 {profile.os.version} (Build {profile.os.build})</p>
              </div>
            </div>
          </div>

          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">硬件总览</h2>
                <p className="text-xs text-slate-400">处理器与内存</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">CPU</p>
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <p className="text-white font-medium mb-1">{profile.cpu.model}</p>
                <p className="text-sm text-slate-400">{profile.cpu.cores} 核心 / {profile.cpu.threads} 线程</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">内存</p>
                  <MemoryStick className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-white font-medium">{formatBytes(profile.memory.used * 1024 * 1024)}</p>
                  <p className="text-sm text-slate-400">/ {formatBytes(profile.memory.total * 1024 * 1024)}</p>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      memoryPercent > 80 ? 'bg-danger' : memoryPercent > 60 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${memoryPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{memoryPercent.toFixed(1)}% 已使用</p>
              </div>
            </div>
          </div>

          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">磁盘状态</h2>
                <p className="text-xs text-slate-400">存储空间使用情况</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diskData} layout="vertical" barSize={32}>
                  <XAxis type="number" tickFormatter={(v) => `${v}GB`} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={14} width={50} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} GB`,
                      name === 'used' ? '已用' : name === 'free' ? '可用' : '总计'
                    ]}
                  />
                  <Bar dataKey="used" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="free" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4">
              {profile.disks.map((disk) => (
                <div key={disk.letter} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span className="text-sm text-slate-300">{disk.letter} {disk.label}</span>
                  <span className="text-sm text-slate-500">
                    {formatBytes(disk.free)} 可用 / {formatBytes(disk.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">网络信息</h2>
                <p className="text-xs text-slate-400">适配器与连接</p>
              </div>
            </div>
            <div className="space-y-3">
              {profile.network.map((adapter, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{adapter.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      adapter.status === 'connected'
                        ? 'bg-success/20 text-success'
                        : 'bg-slate-600/50 text-slate-400'
                    }`}>
                      {adapter.status === 'connected' ? '已连接' : '已断开'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">
                      <span className="text-slate-500">类型：</span>{adapter.type}
                    </p>
                    <p className="text-slate-400 font-mono">
                      <span className="text-slate-500">IPv4：</span>{adapter.ipv4}
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500">MAC：</span>
                      <span className="font-mono">{adapter.mac}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">外设状态</h2>
                <p className="text-xs text-slate-400">已连接设备</p>
              </div>
            </div>
            <div className="space-y-2">
              {profile.peripherals.filter(p => p.status === 'connected').map((peripheral) => (
                <div key={peripheral.id} className="flex items-center gap-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${
                    peripheral.status === 'connected' ? 'bg-success' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{peripheral.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{peripheral.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">快速统计</h2>
                <p className="text-xs text-slate-400">系统概览</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{profile.software.length}</p>
                <p className="text-xs text-slate-500">已安装软件</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">{profile.startupItems.filter(s => s.enabled).length}</p>
                <p className="text-xs text-slate-500">启动项</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-warning">{profile.shares.length}</p>
                <p className="text-xs text-slate-500">共享文件夹</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{profile.users.length}</p>
                <p className="text-xs text-slate-500">用户账户</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

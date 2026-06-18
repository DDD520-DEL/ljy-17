import { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Gift, 
  Users, 
  Flame,
  CalendarDays,
  Heart,
  Crown,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

function GenerationBarChart() {
  const { ancestors } = useAppStore();
  
  const data = useMemo(() => {
    const genMap: Record<number, number> = {};
    ancestors.forEach(a => {
      genMap[a.generation] = (genMap[a.generation] || 0) + 1;
    });
    const sorted = Object.entries(genMap)
      .map(([gen, count]) => ({ generation: Number(gen), count }))
      .sort((a, b) => a.generation - b.generation);
    return sorted;
  }, [ancestors]);

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const genLabel = (gen: number) => {
    if (gen < 0) return `祖上${Math.abs(gen)}代`;
    if (gen === 0) return '父辈';
    if (gen === 1) return '我辈';
    if (gen === 2) return '子辈';
    return `第${gen}代`;
  };

  const colors = [
    'from-amber-400 to-amber-600',
    'from-orange-400 to-orange-600',
    'from-rose-400 to-rose-600',
    'from-red-400 to-red-600',
    'from-pink-400 to-pink-600',
  ];

  return (
    <div className="h-64 flex items-end justify-around gap-3 px-2">
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-brown-400">
          <span>暂无数据</span>
        </div>
      ) : (
        data.map((item, idx) => {
          const height = (item.count / maxCount) * 100;
          return (
            <div key={item.generation} className="flex flex-col items-center gap-2 flex-1">
              <div className="text-sm font-bold text-brown-700 font-serif">{item.count}</div>
              <div 
                className={`w-full max-w-16 rounded-t-xl bg-gradient-to-t ${colors[idx % colors.length]} shadow-soft transition-all duration-500 hover:opacity-90 relative group`}
                style={{ height: `${Math.max(height, 8)}%`, minHeight: '24px' }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brown-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.count}人
                </div>
              </div>
              <div className="text-xs text-brown-500 text-center whitespace-nowrap">{genLabel(item.generation)}</div>
            </div>
          );
        })
      )}
    </div>
  );
}

function RitualTrendLineChart() {
  const { rituals } = useAppStore();
  
  const data = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const years: { year: number; count: number }[] = [];
    
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const count = rituals.filter(r => {
        const ritualYear = new Date(r.date).getFullYear();
        return ritualYear === year;
      }).length;
      years.push({ year, count });
    }
    return years;
  }, [rituals]);

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const width = 100;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 25 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.count / maxCount) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="relative h-64">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * ratio}
            x2={width - padding.right}
            y2={padding.top + chartHeight * ratio}
            stroke="#e5d5c8"
            strokeWidth="0.3"
            strokeDasharray="1 1"
          />
        ))}
        <path d={areaD} fill="url(#areaGradient)" />
        <path d={pathD} fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="1.8" fill="#fff" stroke="#d4af37" strokeWidth="1" />
            <text 
              x={p.x} 
              y={p.y - 4} 
              textAnchor="middle" 
              fontSize="3.5" 
              fill="#572a0e" 
              fontWeight="bold"
            >
              {p.count}
            </text>
            <text 
              x={p.x} 
              y={height - 5} 
              textAnchor="middle" 
              fontSize="3.5" 
              fill="#a67c52"
            >
              {p.year}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function OfferingRankBarChart() {
  const { rituals } = useAppStore();
  
  const data = useMemo(() => {
    const offeringCount: Record<string, number> = {};
    rituals.forEach(r => {
      r.offerings.forEach(o => {
        offeringCount[o] = (offeringCount[o] || 0) + 1;
      });
    });
    return Object.entries(offeringCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [rituals]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const bgColors = [
    'bg-gradient-to-r from-amber-400 to-amber-500',
    'bg-gradient-to-r from-orange-400 to-orange-500',
    'bg-gradient-to-r from-rose-400 to-rose-500',
    'bg-gradient-to-r from-teal-400 to-teal-500',
    'bg-gradient-to-r from-blue-400 to-blue-500',
    'bg-gradient-to-r from-purple-400 to-purple-500',
  ];

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-brown-400">
          <span>暂无数据</span>
        </div>
      ) : (
        data.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${idx < 3 ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow' : 'bg-brown-300'}`}>
                {idx + 1}
              </span>
            </div>
            <div className="w-20 flex-shrink-0 text-sm text-brown-700 font-medium truncate">{item.name}</div>
            <div className="flex-1 h-7 bg-cream-100 rounded-full overflow-hidden relative">
              <div 
                className={`h-full ${bgColors[idx % bgColors.length]} rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              >
                <span className="text-white text-xs font-bold drop-shadow-sm">{item.count}次</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MemberAlivePieChart() {
  const { members, ancestors } = useAppStore();
  
  const data = useMemo(() => {
    const alive = members.filter(m => m.isAlive).length;
    const deceased = members.filter(m => !m.isAlive).length + ancestors.length;
    return [
      { label: '在世家属', value: alive, color: '#10b981' },
      { label: '已故先人', value: deceased, color: '#d4af37' },
    ];
  }, [members, ancestors]);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 36;
  const innerRadius = 22;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercent = 0;
  const segments = data.map(d => {
    const percent = total > 0 ? d.value / total : 0;
    const dashArray = `${percent * circumference} ${circumference}`;
    const dashOffset = -cumulativePercent * circumference;
    cumulativePercent += percent;
    return { ...d, percent, dashArray, dashOffset };
  });

  return (
    <div className="flex items-center justify-around gap-6 h-64">
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f3ebe4"
            strokeWidth={radius - innerRadius}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={radius - innerRadius}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              className="transition-all duration-700"
              style={{ transformOrigin: '50% 50%' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-serif text-brown-800">{total}</span>
          <span className="text-xs text-brown-500">总人数</span>
        </div>
      </div>
      <div className="flex-1 space-y-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-3">
            <span 
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-soft" 
              style={{ backgroundColor: seg.color }}
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-brown-700">{seg.label}</span>
                <span className="text-lg font-bold font-serif text-brown-800">{seg.value}</span>
              </div>
              <div className="mt-1 h-1.5 bg-cream-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${seg.percent * 100}%`, backgroundColor: seg.color }}
                />
              </div>
            </div>
            <span className="text-sm text-brown-500 w-10 text-right">{(seg.percent * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const { ancestors, rituals, members, offerings } = useAppStore();

  const totalParticipants = useMemo(() => {
    const unique = new Set<string>();
    rituals.forEach(r => r.participants.forEach(p => unique.add(p)));
    return unique.size;
  }, [rituals]);

  const totalOfferingsUsed = useMemo(() => {
    return rituals.reduce((sum, r) => sum + r.offerings.length, 0);
  }, [rituals]);

  const stats = [
    { 
      label: '先人数', 
      value: ancestors.length, 
      icon: Flame, 
      color: 'from-orange-400 to-red-500',
      bg: 'bg-orange-50',
      sub: '历代先人'
    },
    { 
      label: '祭祀记录', 
      value: rituals.length, 
      icon: CalendarDays, 
      color: 'from-emerald-400 to-green-500',
      bg: 'bg-emerald-50',
      sub: '累计祭祀'
    },
    { 
      label: '家属人数', 
      value: members.length, 
      icon: Users, 
      color: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-50',
      sub: '在世成员'
    },
    { 
      label: '供品种类', 
      value: offerings.length, 
      icon: Gift, 
      color: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
      sub: '库存种类'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-gold-500 via-amber-500 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            数据统计看板
          </h1>
          <p className="text-amber-50 mb-6 max-w-xl">
            直观了解家族祭祀的整体情况，数据实时更新，一目了然。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className="stat-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl ${stat.bg} mb-3`}>
                  <Icon className={`w-7 h-7 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                </div>
                <p className="text-3xl font-bold text-brown-800 font-serif mb-1">{stat.value}</p>
                <p className="text-brown-500 text-xs">{stat.label}</p>
                <p className="text-brown-400 text-xs mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-500" />
              各世代先人数量分布
            </h2>
          </div>
          <GenerationBarChart />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              近几年祭祀次数趋势
            </h2>
          </div>
          <RitualTrendLineChart />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <Gift className="w-5 h-5 text-rose-500" />
              最常使用的供品排行
            </h2>
            <span className="text-xs text-brown-400">累计使用 {totalOfferingsUsed} 次</span>
          </div>
          <OfferingRankBarChart />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              家属在世与已故比例
            </h2>
            <span className="text-xs text-brown-400">参与祭祀 {totalParticipants} 人</span>
          </div>
          <MemberAlivePieChart />
        </div>
      </div>
    </div>
  );
}

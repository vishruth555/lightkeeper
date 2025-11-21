'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Layers, Paintbrush, Timer, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#2563eb', '#0891b2', '#d97706', '#db2777', '#7c3aed', '#059669'];

export default function TrendsPage() {
  const { id } = useParams() as { id: string };

  const { data: page } = useQuery({
    queryKey: ['page', id],
    queryFn: () => endpoints.getPage(id).then(res => res.data),
  });

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits', id],
    queryFn: () => endpoints.getPageAudits(id).then(res => res.data),
  });

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center text-gray-500 font-medium">Loading performance data...</div>;

  const sortedAudits = audits ? [...audits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : [];
  
  const chartData = sortedAudits.map(audit => {
    const entry: any = {
      date: format(new Date(audit.created_at), 'MM/dd HH:mm'),
      fullDate: new Date(audit.created_at).toLocaleString(),
      psi: audit.psi_score,
      seo: audit.seo_score
    };
    Object.entries(audit.metrics || {}).forEach(([key, value]) => {
        entry[key] = value;
    });
    return entry;
  });

  const allKeys = Array.from(new Set(sortedAudits.flatMap(audit => Object.keys(audit.metrics || {}))));
  const clsKeys = allKeys.filter(k => k.toLowerCase().includes('cumulative') || k.toLowerCase().includes('shift'));
  const paintKeys = allKeys.filter(k => k.toLowerCase().includes('paint') || k.toLowerCase().includes('contentful'));
  const otherKeys = allKeys.filter(k => !clsKeys.includes(k) && !paintKeys.includes(k));

  const latestAudit = sortedAudits.length > 0 ? sortedAudits[sortedAudits.length - 1] : null;

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                   {page?.name} 
                   <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 uppercase">
                      {page?.device}
                   </span>
                </h1>
                <a href={page?.url} target="_blank" className="flex items-center text-indigo-600 mt-1 text-sm font-medium hover:underline">
                    {page?.url} <ExternalLink size={12} className="ml-1"/>
                </a>
            </div>
            
            {latestAudit && (
                <div className="flex gap-8">
                    <div className="text-center">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">PSI Score</div>
                        <div className={`text-3xl font-bold ${latestAudit.psi_score >= 90 ? 'text-emerald-600' : latestAudit.psi_score >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
                            {latestAudit.psi_score}
                        </div>
                    </div>
                    <div className="text-center">
                         <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">SEO Score</div>
                         <div className="text-3xl font-bold text-blue-600">{latestAudit.seo_score}</div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="space-y-8">
          {/* 1. Core Scores Graph (Restored) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <BarChart3 className="text-indigo-600" size={18} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-gray-900">Core Scores History</h3>
                    <p className="text-xs text-gray-500">Trend of PSI (Performance) and SEO scores over time.</p>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 11, fill: '#64748b'}} 
                            axisLine={{ stroke: '#e2e8f0' }} 
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis 
                            domain={[0, 100]} 
                            tick={{fontSize: 11, fill: '#64748b'}} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                            labelStyle={{ marginBottom: '8px', color: '#64748b', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="psi" stroke="#059669" name="PSI Score" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="seo" stroke="#2563eb" name="SEO Score" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Layout Shift (CLS) */}
          <MetricChart 
            title="Layout Stability (CLS)" 
            icon={<Layers className="text-purple-600" size={18} />}
            data={chartData} 
            keys={clsKeys} 
            description="Cumulative Layout Shift measures visual stability."
          />

          {/* 3. Paint Timing (LCP, FCP) */}
          <MetricChart 
            title="Paint Timing (Loading)" 
            icon={<Paintbrush className="text-emerald-600" size={18} />}
            data={chartData} 
            keys={paintKeys}
            description="First Contentful Paint & Largest Contentful Paint."
          />

          {/* 4. Interactivity & Others */}
          <MetricChart 
            title="Interactivity & Others" 
            icon={<Timer className="text-amber-600" size={18} />}
            data={chartData} 
            keys={otherKeys}
            description="Total Blocking Time, Speed Index, and miscellaneous metrics."
          />
      </div>
    </div>
  );
}

function MetricChart({ title, icon, data, keys, description }: { title: string, icon: React.ReactNode, data: any[], keys: string[], description: string }) {
    if (keys.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-50 rounded border border-gray-100">{icon}</div>
                <div>
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 11, fill: '#64748b'}} 
                            axisLine={{ stroke: '#e2e8f0' }} 
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis 
                            tick={{fontSize: 11, fill: '#64748b'}} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                            labelStyle={{ marginBottom: '8px', color: '#64748b', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                        {keys.map((key, index) => (
                            <Line 
                                key={key} 
                                type="monotone" 
                                dataKey={key} 
                                stroke={COLORS[index % COLORS.length]} 
                                name={key.replace(/-/g, ' ')} 
                                strokeWidth={2} 
                                dot={{ r: 3, strokeWidth: 1, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
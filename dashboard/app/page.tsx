'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { Page } from '@/lib/types';
import Link from 'next/link';
import { 
  Trash2, Play, LineChart, Edit, Plus, Loader2, 
  Monitor, Smartphone, X, Zap, Activity 
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function Dashboard() {
  const queryClient = useQueryClient();
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  
  // Run Result State
  const [runResult, setRunResult] = useState<any>(null);
  const [runResultPageId, setRunResultPageId] = useState<string | null>(null);

  // Fetch Pages
  const { data: pages, isLoading, isError } = useQuery({
    queryKey: ['pages'],
    queryFn: () => endpoints.getPages().then((res) => res.data),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: endpoints.deletePage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      endpoints.updatePage(id, { isEnabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => endpoints.runAudit(id),
    onSuccess: (data, variables) => {
      setRunResult(data.data);
      setRunResultPageId(variables);
    },
    onError: () => alert('Failed to start audit'),
  });

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: any = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      env: formData.get('env') as string,
      device: formData.get('device') as 'mobile' | 'desktop',
      benchmarkScore: Number(formData.get('benchmarkScore')),
      thresholdPercentage: Number(formData.get('thresholdPercentage')),
      isEnabled: isEditMode && selectedPage ? selectedPage.isEnabled : true,
    };

    try {
      if (isEditMode && selectedPage) {
        await endpoints.updatePage(selectedPage._id, payload);
      } else {
        await endpoints.createPage(payload);
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    } catch (error) {
      console.error(error);
      alert('Error saving page');
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedPage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (page: Page) => {
    setIsEditMode(true);
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  if (isError) return <div className="mt-20 text-center text-red-600 font-medium">Unable to connect to service.</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Monitors</h2>
          <p className="text-sm text-gray-500 mt-1">Manage lighthouse audits and thresholds.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Website
        </button>
      </div>

      {/* Enterprise Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {pages && pages.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target URL</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Config</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Benchmark</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          {/* FIXED: Correctly balanced braces for the map function */}
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => {
              // 1. We define the variable here
              const isThisPageRunning = runMutation.isPending && runMutation.variables === page._id;

              // 2. We must explicitly 'return' the JSX because we used { } for the map
              return (
                <tr key={page._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <button
                      onClick={() => toggleMutation.mutate({ id: page._id, isEnabled: !page.isEnabled })}
                      className={clsx(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400",
                          page.isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                      )}
                      >
                      <span className={clsx(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                          page.isEnabled ? 'translate-x-5' : 'translate-x-1'
                      )} />
                      </button>
                  </td>
                  <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 block">{page.name}</span>
                  </td>
                  <td className="px-6 py-4">
                       <a href={page.url} target="_blank" className="text-sm text-gray-500 hover:text-indigo-600 hover:underline truncate max-w-[200px] block">
                        {page.url}
                      </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide">
                              {page.env}
                          </span>
                          <div className="flex items-center gap-1 text-gray-500" title={page.device}>
                              {page.device === 'mobile' ? <Smartphone size={15}/> : <Monitor size={15}/> }
                          </div>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-900">{page.benchmarkScore}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">±{page.thresholdPercentage}%</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-4">
                      <button 
                          onClick={() => runMutation.mutate(page._id)} 
                          disabled={runMutation.isPending}
                          className="text-gray-400 hover:text-emerald-600 transition-colors"
                          title="Run Audit"
                      >
                          {/* 3. Use the variable here */}
                          {isThisPageRunning ? (
                              <Loader2 className="animate-spin" size={18} />
                          ) : (
                              <Play size={18} />
                          )}
                      </button>
                      
                      <Link href={`/trends/${page._id}`} className="text-gray-400 hover:text-indigo-600 transition-colors" title="View Trends">
                           <LineChart size={18} />
                      </Link>
                      
                      <button onClick={() => openEditModal(page)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Configuration">
                          <Edit size={18} />
                      </button>
                      
                      <button 
                          onClick={() => { if(confirm('Delete this page monitoring?')) deleteMutation.mutate(page._id) }} 
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                      >
                          <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        ) : (
            <div className="text-center py-24 bg-gray-50/30">
                <div className="bg-white w-16 h-16 rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Activity className="text-gray-400" size={24} />
                </div>
                <h3 className="text-base font-medium text-gray-900">No pages monitored</h3>
                <p className="text-sm text-gray-500 mt-1">Get started by adding a new page.</p>
                <button onClick={openCreateModal} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">Add Page &rarr;</button>
            </div>
        )}
      </div>

      {/* LIGHT ENTERPRISE EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200 animate-in zoom-in-95 duration-150">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Monitor' : 'New Monitor'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Page Name</label>
                        <input name="name" placeholder="e.g. Homepage Production" defaultValue={selectedPage?.name} required 
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">URL</label>
                        <input name="url" type="url" placeholder="https://..." defaultValue={selectedPage?.url} required 
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Environment</label>
                            <input name="env" placeholder="prod" defaultValue={selectedPage?.env || 'prod'} 
                                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Device</label>
                            <select name="device" defaultValue={selectedPage?.device || 'desktop'} 
                                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 focus:outline-none focus:border-indigo-500 bg-white">
                                <option value="desktop">Desktop</option>
                                <option value="mobile">Mobile</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-gray-200 mt-2">
                         <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Benchmark</label>
                                <div className="relative">
                                    <input type="number" name="benchmarkScore" min="0" max="100" defaultValue={selectedPage?.benchmarkScore || 90} 
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 focus:border-indigo-500" />
                                    <span className="absolute right-3 top-2 text-gray-400 text-xs">/100</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Threshold</label>
                                <div className="relative">
                                    <input type="number" name="thresholdPercentage" min="0" max="100" defaultValue={selectedPage?.thresholdPercentage || 10} 
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 focus:border-indigo-500" />
                                    <span className="absolute right-3 top-2 text-gray-400 text-xs">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300 transition">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 shadow-sm transition">
                            {isEditMode ? 'Save Changes' : 'Create Monitor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* RUN RESULT MODAL */}
      {runResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="text-amber-500 fill-amber-500" size={18} />
                        Audit Result
                    </h3>
                    <button onClick={() => setRunResult(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto bg-white flex-1">
                    <div className="flex justify-center gap-12 mb-8">
                        <CircularScore label="Performance" value={runResult.psi_score} />
                        <CircularScore label="SEO" value={runResult.seo_score} color="blue" />
                    </div>

                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Detailed Metrics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {runResult.metrics && Object.entries(runResult.metrics).map(([key, value]) => (
                            <div key={key} className="p-3 rounded border border-gray-200 bg-gray-50/50">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block truncate" title={key}>
                                    {key.replace(/-/g, ' ')}
                                </span>
                                <span className="text-sm font-bold text-gray-900 font-mono">
                                    {typeof value === 'number' ? Math.round(value * 100) / 100 : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setRunResult(null)} 
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:border-gray-300 border border-transparent rounded transition-all"
                    >
                        Close
                    </button>
                    <Link 
                        href={`/trends/${runResultPageId}`} 
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 flex items-center gap-2 transition-all"
                    >
                        <LineChart size={16} />
                        View Trends
                    </Link>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}

// Minimal Score Component for Modal
function CircularScore({ label, value, color = 'green' }: { label: string, value: number, color?: string }) {
    const isGreen = value >= 90;
    const isOrange = value >= 50 && value < 90;
    
    let textColor = 'text-emerald-600';
    let borderColor = 'border-emerald-200';
    
    if (color === 'blue') {
        textColor = 'text-blue-600';
        borderColor = 'border-blue-200';
    } else if (!isGreen) {
        textColor = isOrange ? 'text-orange-600' : 'text-red-600';
        borderColor = isOrange ? 'border-orange-200' : 'border-red-200';
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`h-16 w-16 flex items-center justify-center rounded-full border-4 ${borderColor} bg-white`}>
                 <span className={`text-xl font-bold ${textColor}`}>{value}</span>
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
        </div>
    )
}
import axios from 'axios';
import { Page, PageScore, PageUpdate } from './types';


export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const endpoints = {
  // Pages
  getPages: () => api.get<Page[]>('/pages/'),
  createPage: (data: Omit<Page, '_id' | 'created_at'>) => api.post<Page>('/pages/', data),
  updatePage: (id: string, data: PageUpdate) => api.put<Page>(`/pages/${id}`, data),
  deletePage: (id: string) => api.delete(`/pages/${id}`),
  getPage: (id: string) => api.get<Page>(`/pages/${id}`),

  // Runs & Audits
  runAudit: (id: string) => api.post(`/run/${id}`),
  getPageAudits: (id: string) => api.get<PageScore[]>(`/audits/${id}`),
};
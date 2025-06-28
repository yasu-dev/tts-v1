'use client';

import DashboardLayout from '../components/layouts/DashboardLayout';
import { useState } from 'react';

export default function InventoryPage() {
  const [inventoryStats] = useState({
    totalItems: 156,
    listed: 89,
    inspection: 45,
    storage: 22,
    totalValue: 45600000,
  });

  const [inventory] = useState([
    { id: 1, name: 'Canon EOS R5', sku: 'TWD-20240115-001', category: 'カメラ本体', status: '出品中', location: 'A-01-03', value: 450000, certifications: ['MINT', 'AUTHENTIC'] },
    { id: 2, name: 'Sony FE 24-70mm f/2.8 GM', sku: 'TWD-20240115-002', category: 'レンズ', status: '検品中', location: 'B-02-05', value: 280000, certifications: ['PREMIUM'] },
    { id: 3, name: 'Rolex Submariner', sku: 'TWD-20240115-003', category: '時計', status: '保管中', location: 'C-01-01', value: 1200000, certifications: ['CERTIFIED', 'LUXURY', 'RARE'] },
  ]);

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Page Header - Intelligence Card Style */}
        <div className="intelligence-card europe">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-nexus-text-primary mb-2">在庫管理</h1>
                <h2 className="text-xl font-bold text-nexus-text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                  📷 商品在庫ビュー
                </h2>
                <p className="text-nexus-text-secondary mt-1">
                  商品在庫の状況を確認・管理できます
                </p>
              </div>
              <div className="flex gap-4">
                <button className="nexus-button primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  一括出品
                </button>
                <button className="nexus-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  検品依頼
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                  </div>
                  <span className="status-badge info">{inventoryStats.totalItems}点</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.totalItems}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総在庫数
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb green">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success">出品中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.listed}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  出品中
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <span className="status-badge warning">検品中</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.inspection}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  検品中
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="action-orb red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-nexus-green">総資産</span>
                </div>
                <div className="metric-value font-display text-3xl font-bold text-nexus-text-primary">
                  ¥{(inventoryStats.totalValue / 10000).toLocaleString()}
                  <span className="text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-2">
                  総評価額
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table - Holo Table Style */}
        <div className="intelligence-card europe">
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-nexus-text-primary">在庫リスト</h3>
              <p className="text-nexus-text-secondary mt-1">現在の在庫状況</p>
            </div>
            
            <div className="holo-table">
              <table className="w-full">
                <thead className="holo-header">
                  <tr>
                    <th className="text-left">商品名</th>
                    <th className="text-left">SKU</th>
                    <th className="text-left">カテゴリー</th>
                    <th className="text-center">ステータス</th>
                    <th className="text-left">保管場所</th>
                    <th className="text-right">評価額</th>
                    <th className="text-center">認証</th>
                  </tr>
                </thead>
                <tbody className="holo-body">
                  {inventory.map((item) => (
                    <tr key={item.id} className="holo-row">
                      <td className="font-medium text-nexus-text-primary">{item.name}</td>
                      <td className="font-mono text-nexus-text-primary">{item.sku}</td>
                      <td>{item.category}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`status-orb status-${item.status === '出品中' ? 'optimal' : 'monitoring'}`} />
                          <span className={`status-badge ${item.status === '出品中' ? 'success' : 'warning'}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono">{item.location}</td>
                      <td className="text-right font-display font-bold">¥{item.value.toLocaleString()}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1 flex-wrap">
                          {item.certifications.map(cert => (
                            <span key={cert} className={`cert-nano cert-${cert.toLowerCase()}`}>
                              {cert}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
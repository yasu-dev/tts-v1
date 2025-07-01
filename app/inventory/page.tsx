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
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-nexus-text-primary mb-2">在庫管理</h1>
                <h2 className="text-base sm:text-xl font-bold text-nexus-text-primary flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                  商品在庫ビュー
                </h2>
                <p className="text-nexus-text-secondary mt-1 text-xs sm:text-sm">
                  商品在庫の状況を確認・管理できます
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <button className="nexus-button primary text-xs sm:text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="hidden sm:inline">一括出品</span>
                  <span className="sm:hidden">出品</span>
                </button>
                <button className="nexus-button text-xs sm:text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <span className="hidden sm:inline">検品依頼</span>
                  <span className="sm:hidden">検品</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview - Intelligence Metrics Style */}
        <div className="intelligence-metrics">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="intelligence-card europe">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb blue w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                  </div>
                  <span className="status-badge info text-[10px] sm:text-xs">{inventoryStats.totalItems}点</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.totalItems}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総在庫数
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb green w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="status-badge success text-[10px] sm:text-xs">出品中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.listed}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  出品中
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <span className="status-badge warning text-[10px] sm:text-xs">検品中</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  {inventoryStats.inspection}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">点</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  検品中
                </div>
              </div>
            </div>

            <div className="intelligence-card europe">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className="action-orb red w-6 h-6 sm:w-8 sm:h-8">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-nexus-green">総資産</span>
                </div>
                <div className="metric-value font-display text-xl sm:text-2xl md:text-3xl font-bold text-nexus-text-primary">
                  ¥{(inventoryStats.totalValue / 10000).toLocaleString()}
                  <span className="text-sm sm:text-lg font-normal text-nexus-text-secondary ml-1">万</span>
                </div>
                <div className="metric-label text-nexus-text-secondary font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
                  総評価額
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table - Holo Table Style */}
        <div className="intelligence-card europe">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mb-3 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-display font-bold text-nexus-text-primary">在庫リスト</h3>
              <p className="text-nexus-text-secondary mt-1 text-xs sm:text-sm">現在の在庫状況</p>
            </div>
            
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
              <div className="holo-table min-w-[700px] px-3 sm:px-4 md:px-6 lg:px-8">
                <table className="w-full">
                  <thead className="holo-header">
                    <tr>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">商品名</th>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">SKU</th>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">カテゴリー</th>
                      <th className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm">ステータス</th>
                      <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm">保管場所</th>
                      <th className="text-right py-2 px-1 sm:px-2 text-xs sm:text-sm">評価額</th>
                      <th className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm">認証</th>
                    </tr>
                  </thead>
                  <tbody className="holo-body">
                    {inventory.map((item) => (
                      <tr key={item.id} className="holo-row">
                        <td className="font-medium text-nexus-text-primary py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.name}</td>
                        <td className="font-mono text-nexus-text-primary py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.sku}</td>
                        <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.category}</td>
                        <td className="text-center py-2 px-1 sm:px-2">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <div className={`status-orb status-${item.status === '出品中' ? 'optimal' : 'monitoring'} w-2 h-2`} />
                            <span className={`status-badge ${item.status === '出品中' ? 'success' : 'warning'} text-[10px] sm:text-xs`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="font-mono py-2 px-1 sm:px-2 text-xs sm:text-sm">{item.location}</td>
                        <td className="text-right font-display font-bold py-2 px-1 sm:px-2 text-xs sm:text-sm">¥{item.value.toLocaleString()}</td>
                        <td className="text-center py-2 px-1 sm:px-2">
                          <div className="flex justify-center gap-1 flex-wrap">
                            {item.certifications.map(cert => (
                              <span key={cert} className={`cert-nano cert-${cert.toLowerCase()} text-[8px] sm:text-[10px]`}>
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
      </div>
    </DashboardLayout>
  );
} 
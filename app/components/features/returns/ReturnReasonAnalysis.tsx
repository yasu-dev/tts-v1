'use client'

import React, { useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Package, AlertCircle } from 'lucide-react'
import { ContentCard } from '@/app/components/ui'

const returnReasonData = [
  { reason: '商品説明と異なる', count: 45, percentage: 30 },
  { reason: '破損・不具合', count: 30, percentage: 20 },
  { reason: 'サイズ違い', count: 25, percentage: 17 },
  { reason: '思っていたものと違う', count: 20, percentage: 13 },
  { reason: '配送遅延', count: 15, percentage: 10 },
  { reason: 'その他', count: 15, percentage: 10 }
]

const categoryReturnRate = [
  { category: '時計', rate: 3.2, trend: 'up' },
  { category: 'バッグ', rate: 2.8, trend: 'down' },
  { category: 'アクセサリー', rate: 4.1, trend: 'up' },
  { category: '衣類', rate: 5.2, trend: 'stable' },
  { category: '靴', rate: 3.5, trend: 'down' }
]

const monthlyTrend = [
  { month: '1月', returns: 23 },
  { month: '2月', returns: 28 },
  { month: '3月', returns: 32 },
  { month: '4月', returns: 25 },
  { month: '5月', returns: 30 },
  { month: '6月', returns: 35 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

export function ReturnReasonAnalysis() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">返品理由分析</h2>
          <div className="flex gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="week">今週</option>
              <option value="month">今月</option>
              <option value="quarter">四半期</option>
              <option value="year">年間</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">全カテゴリー</option>
              <option value="watch">時計</option>
              <option value="bag">バッグ</option>
              <option value="accessory">アクセサリー</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm">総返品数</p>
                <p className="text-2xl font-bold">150</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm">返品率</p>
                <p className="text-2xl font-bold">3.8%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm">改善必要項目</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">返品理由内訳</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={returnReasonData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ reason, percentage }) => `${reason} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {returnReasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold mb-4">月別返品推移</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="returns" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-4">カテゴリー別返品率</h3>
          <div className="space-y-3">
            {categoryReturnRate.map(item => (
              <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.category}</span>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">{item.rate}%</span>
                  {item.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
                  {item.trend === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
                  {item.trend === 'stable' && <div className="w-5 h-5 bg-gray-400 rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">改善提案</h4>
          <ul className="space-y-2 text-yellow-700">
            <li>• 「商品説明と異なる」が最多 - 商品説明の精度向上が必要</li>
            <li>• アクセサリーカテゴリーの返品率が上昇傾向 - 品質チェックの強化を推奨</li>
            <li>• 配送遅延による返品を削減するため、配送プロセスの見直しが必要</li>
          </ul>
        </div>
      </ContentCard>
    </div>
  )
} 
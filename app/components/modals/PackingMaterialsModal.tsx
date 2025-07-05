'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PackingMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrder: (materials: any[]) => void;
}

interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  orderQuantity: number;
  price: number;
  supplier: string;
}

export default function PackingMaterialsModal({ isOpen, onClose, onOrder }: PackingMaterialsModalProps) {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 'bubble',
      name: 'プチプチ',
      stock: 50,
      unit: 'm',
      minStock: 100,
      orderQuantity: 0,
      price: 150,
      supplier: 'パッケージサプライ'
    },
    {
      id: 'box_s',
      name: '小箱 (20x15x10cm)',
      stock: 120,
      unit: '個',
      minStock: 50,
      orderQuantity: 0,
      price: 80,
      supplier: 'ダンボール工房'
    },
    {
      id: 'box_m',
      name: '中箱 (30x25x20cm)',
      stock: 80,
      unit: '個',
      minStock: 30,
      orderQuantity: 0,
      price: 120,
      supplier: 'ダンボール工房'
    },
    {
      id: 'box_l',
      name: '大箱 (40x35x30cm)',
      stock: 0,
      unit: '個',
      minStock: 20,
      orderQuantity: 50,
      price: 200,
      supplier: 'ダンボール工房'
    },
    {
      id: 'cushion',
      name: '緩衝材',
      stock: 200,
      unit: '個',
      minStock: 100,
      orderQuantity: 0,
      price: 50,
      supplier: 'パッケージサプライ'
    },
    {
      id: 'tape',
      name: '梱包テープ',
      stock: 15,
      unit: '巻',
      minStock: 20,
      orderQuantity: 10,
      price: 300,
      supplier: 'オフィス用品店'
    }
  ]);

  const handleQuantityChange = (materialId: string, quantity: number) => {
    setMaterials(prev => prev.map(material => 
      material.id === materialId 
        ? { ...material, orderQuantity: Math.max(0, quantity) }
        : material
    ));
  };

  const handleOrder = () => {
    const itemsToOrder = materials.filter(m => m.orderQuantity > 0);
    if (itemsToOrder.length > 0) {
      onOrder(itemsToOrder);
    }
    onClose();
  };

  const totalOrderCost = materials.reduce((sum, material) => 
    sum + (material.orderQuantity * material.price), 0
  );

  const lowStockItems = materials.filter(m => m.stock < m.minStock);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">梱包資材確認・発注</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {lowStockItems.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="text-sm font-medium text-yellow-800">在庫不足の資材があります</h4>
            </div>
            <ul className="text-sm text-yellow-700">
              {lowStockItems.map(item => (
                <li key={item.id}>
                  {item.name}: 現在{item.stock}{item.unit} (最小在庫: {item.minStock}{item.unit})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">資材名</th>
                <th className="border border-gray-300 px-4 py-2 text-center">現在在庫</th>
                <th className="border border-gray-300 px-4 py-2 text-center">最小在庫</th>
                <th className="border border-gray-300 px-4 py-2 text-center">単価</th>
                <th className="border border-gray-300 px-4 py-2 text-center">発注数量</th>
                <th className="border border-gray-300 px-4 py-2 text-center">小計</th>
                <th className="border border-gray-300 px-4 py-2 text-center">供給元</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className={material.stock < material.minStock ? 'bg-red-50' : ''}>
                  <td className="border border-gray-300 px-4 py-2">
                    {material.name}
                    {material.stock < material.minStock && (
                      <span className="ml-2 text-red-600 text-xs">⚠️ 在庫不足</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {material.stock} {material.unit}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {material.minStock} {material.unit}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ¥{material.price.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="number"
                      value={material.orderQuantity}
                      onChange={(e) => handleQuantityChange(material.id, parseInt(e.target.value) || 0)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                      min="0"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ¥{(material.orderQuantity * material.price).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                    {material.supplier}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">発注合計金額:</span>
            <span className="text-lg font-bold text-blue-600">
              ¥{totalOrderCost.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-6">
          <button
            onClick={handleOrder}
            disabled={totalOrderCost === 0}
            className={`flex-1 py-2 px-4 rounded ${
              totalOrderCost > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            発注する ({materials.filter(m => m.orderQuantity > 0).length}件)
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
} 
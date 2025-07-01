'use client';

import { useState, useEffect } from 'react';
import NexusCard from '@/app/components/ui/NexusCard';
import NexusButton from '@/app/components/ui/NexusButton';

interface Template {
  id: string;
  name: string;
  category: string;
  titleTemplate: string;
  descriptionTemplate: string;
  priceAdjustment: number; // パーセンテージ
  isActive: boolean;
  lastModified: string;
}

export default function ListingTemplateEditor() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    category: 'all',
    titleTemplate: '',
    descriptionTemplate: '',
    priceAdjustment: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // モックデータ
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'カメラ標準テンプレート',
          category: 'camera',
          titleTemplate: '[美品] {name} {condition}ランク 付属品完備',
          descriptionTemplate: `商品名: {name}\nSKU: {sku}\nコンディション: {condition}\n\n【商品説明】\n{description}\n\n【付属品】\n完備\n\n【注意事項】\n中古品のため、細かな傷がある場合があります。`,
          priceAdjustment: -10,
          isActive: true,
          lastModified: '2024-06-20T10:00:00',
        },
        {
          id: '2',
          name: 'レンズ用テンプレート',
          category: 'lens',
          titleTemplate: '{name} 極上美品 {condition}',
          descriptionTemplate: `【商品情報】\n{name}\n\n【コンディション】\n{condition}ランク\n\n詳細: {description}`,
          priceAdjustment: -15,
          isActive: true,
          lastModified: '2024-06-18T14:00:00',
        },
        {
          id: '3',
          name: '高級時計テンプレート',
          category: 'watch',
          titleTemplate: '[正規品] {name} {condition}級品',
          descriptionTemplate: `ブランド: {brand}\nモデル: {name}\n\n状態: {condition}\n\n{description}`,
          priceAdjustment: 0,
          isActive: true,
          lastModified: '2024-06-15T09:00:00',
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('[ERROR] Fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      titleTemplate: template.titleTemplate,
      descriptionTemplate: template.descriptionTemplate,
      priceAdjustment: template.priceAdjustment,
      isActive: template.isActive,
    });
    setIsEditing(false);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      category: 'all',
      titleTemplate: '',
      descriptionTemplate: '',
      priceAdjustment: 0,
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.titleTemplate) {
      alert('テンプレート名とタイトルは必須です');
      return;
    }

    // 保存処理（実装時にはAPIを呼び出す）
    alert('テンプレートを保存しました');
    setIsEditing(false);
    fetchTemplates();
  };

  const handleDelete = async (templateId: string) => {
    const confirmed = confirm('このテンプレートを削除しますか？');
    if (!confirmed) return;

    // 削除処理（実装時にはAPIを呼び出す）
    alert('テンプレートを削除しました');
    setSelectedTemplate(null);
    fetchTemplates();
  };

  const getAvailableVariables = () => {
    return [
      { variable: '{name}', description: '商品名' },
      { variable: '{sku}', description: 'SKU番号' },
      { variable: '{condition}', description: 'コンディション' },
      { variable: '{description}', description: '商品説明' },
      { variable: '{price}', description: '価格' },
      { variable: '{category}', description: 'カテゴリー' },
      { variable: '{brand}', description: 'ブランド名' },
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-nexus-blue rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template List */}
      <div className="lg:col-span-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-nexus-text-primary">
              テンプレート一覧
            </h3>
            <NexusButton onClick={handleNewTemplate} variant="primary" size="sm">
              新規作成
            </NexusButton>
          </div>

          <div className="space-y-2">
            {templates.map((template) => (
              <NexusCard
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-nexus-blue bg-nexus-blue/5'
                    : 'hover:border-nexus-border-hover'
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-nexus-text-primary">
                      {template.name}
                    </h4>
                    <p className="text-sm text-nexus-text-secondary">
                      カテゴリー: {template.category}
                    </p>
                    <p className="text-xs text-nexus-text-muted mt-1">
                      最終更新: {new Date(template.lastModified).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  {template.isActive ? (
                    <span className="cert-nano cert-mint">有効</span>
                  ) : (
                    <span className="cert-nano">無効</span>
                  )}
                </div>
              </NexusCard>
            ))}
          </div>
        </div>
      </div>

      {/* Template Editor */}
      <div className="lg:col-span-2">
        {(selectedTemplate || isEditing) ? (
          <NexusCard className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-nexus-text-primary">
                  {isEditing ? (selectedTemplate ? 'テンプレート編集' : '新規テンプレート') : 'テンプレート詳細'}
                </h3>
                <div className="flex gap-2">
                  {!isEditing && (
                    <NexusButton onClick={() => setIsEditing(true)} variant="secondary">
                      編集
                    </NexusButton>
                  )}
                  {isEditing && (
                    <>
                      <NexusButton onClick={() => setIsEditing(false)} variant="secondary">
                        キャンセル
                      </NexusButton>
                      <NexusButton onClick={handleSave} variant="primary">
                        保存
                      </NexusButton>
                    </>
                  )}
                  {selectedTemplate && !isEditing && (
                    <NexusButton
                      onClick={() => handleDelete(selectedTemplate.id)}
                      variant="secondary"
                      className="text-red-600 hover:text-red-700"
                    >
                      削除
                    </NexusButton>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    テンプレート名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary disabled:opacity-60"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    カテゴリー
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary disabled:opacity-60"
                  >
                    <option value="all">すべて</option>
                    <option value="camera">カメラ</option>
                    <option value="lens">レンズ</option>
                    <option value="watch">時計</option>
                    <option value="accessory">アクセサリー</option>
                  </select>
                </div>

                {/* Title Template */}
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    タイトルテンプレート
                  </label>
                  <input
                    type="text"
                    value={formData.titleTemplate}
                    onChange={(e) => setFormData({ ...formData, titleTemplate: e.target.value })}
                    disabled={!isEditing}
                    placeholder="例: [美品] {name} {condition}ランク"
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary disabled:opacity-60"
                  />
                </div>

                {/* Description Template */}
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    説明文テンプレート
                  </label>
                  <textarea
                    value={formData.descriptionTemplate}
                    onChange={(e) => setFormData({ ...formData, descriptionTemplate: e.target.value })}
                    disabled={!isEditing}
                    rows={8}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary disabled:opacity-60"
                  />
                </div>

                {/* Price Adjustment */}
                <div>
                  <label className="block text-sm font-medium text-nexus-text-secondary mb-2">
                    価格調整（%）
                  </label>
                  <input
                    type="number"
                    value={formData.priceAdjustment}
                    onChange={(e) => setFormData({ ...formData, priceAdjustment: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-nexus-bg-secondary border border-nexus-border rounded-lg focus:ring-2 focus:ring-nexus-blue text-nexus-text-primary disabled:opacity-60"
                  />
                  <p className="text-xs text-nexus-text-muted mt-1">
                    マイナス値で割引、プラス値で割増
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 text-nexus-blue rounded border-nexus-border focus:ring-nexus-blue disabled:opacity-60"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-nexus-text-primary">
                    このテンプレートを有効にする
                  </label>
                </div>
              </div>

              {/* Variable Reference */}
              <div className="mt-6 p-4 bg-nexus-bg-secondary rounded-lg">
                <h4 className="font-medium text-nexus-text-primary mb-2">利用可能な変数</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {getAvailableVariables().map((variable) => (
                    <div key={variable.variable} className="flex justify-between">
                      <code className="text-nexus-blue">{variable.variable}</code>
                      <span className="text-nexus-text-secondary">{variable.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </NexusCard>
        ) : (
          <div className="flex items-center justify-center h-64 text-nexus-text-secondary">
            テンプレートを選択するか、新規作成してください
          </div>
        )}
      </div>
    </div>
  );
} 
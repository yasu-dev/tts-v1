'use client';

import { useState, useEffect } from 'react';
import { BaseModal, NexusButton, NexusSelect, NexusInput, NexusTextarea, NexusCheckbox } from '@/app/components/ui';
import { useToast } from '@/app/components/features/notifications/ToastProvider';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  ShoppingCartIcon, 
  GlobeAltIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  condition: string;
  description?: string;
  imageUrl?: string;
}

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: (listing: any) => void;
}

// 言語設定
const translations = {
  en: {
    title: 'eBay Listing',
    languageToggle: 'Language',
    photosVideo: 'PHOTOS & VIDEO',
    photosVideoDesc: 'You can add up to 24 photos and a 1-minute video. Buyers want to see all details and angles.',
    dragDropFiles: 'Drag and drop files',
    uploadFromComputer: 'Upload from computer',
    itemTitle: 'TITLE',
    itemTitleLabel: 'Item title',
    subtitle: 'Subtitle (optional)',
    customLabel: 'Custom label (SKU)',
    itemCategory: 'ITEM CATEGORY',
    filmCameras: 'Film Cameras',
    cameraPhoto: 'in Cameras & Photo > Film Photography',
    storeCategory: 'Store category',
    itemSpecifics: 'ITEM SPECIFICS',
    required: 'Required',
    buyersNeed: 'Buyers need these details to find your item.',
    brand: 'Brand',
    type: 'Type',
    model: 'Model',
    upc: 'UPC',
    format: 'Format',
    color: 'Color',
    focusType: 'Focus Type',
    series: 'Series',
    features: 'Features',
    mpn: 'MPN',
    unitQuantity: 'Unit Quantity',
    unitType: 'Unit Type',
    countryManufacture: 'Country/Region of Manufacture',
    yearManufactured: 'Year Manufactured',
    warranty: 'Manufacturer Warranty',
    itemWeight: 'Item Weight',
    californiaProp65: 'California Prop 65 Warning',
    itemHeight: 'Item Height',
    itemLength: 'Item Length',
    itemWidth: 'Item Width',
    addCustom: 'Add custom item specific',
    showLess: 'Show less',
    variations: 'VARIATIONS',
    variationsDesc: 'Save time and money by listing multiple variations of your item in one multi-quantity, fixed price listing.',
    condition: 'CONDITION',
    itemCondition: 'Item condition',
    used: 'Used',
    conditionDescription: 'Condition description',
    description: 'DESCRIPTION',
    writeDescription: 'Write a detailed description of your item, or save time and let AI draft it for you',
    useAiDescription: 'Use AI description',
    pricing: 'PRICING',
    formatLabel: 'Format',
    buyItNow: 'Buy It Now',
    itemPrice: 'Item price',
    quantity: 'Quantity',
    paymentPolicy: 'Payment policy',
    allowOffers: 'Allow offers',
    buyersInterested: 'Buyers interested in your item can make you offers -- you can accept, counter or decline.',
    minimumOffer: 'Minimum offer (optional)',
    autoAccept: 'Auto-accept (optional)',
    scheduleYourListing: 'Schedule your listing',
    listingGoesLive: 'Your listing goes live immediately, unless you select a time and date you want it to start.',
    promoteYourListing: 'PROMOTE YOUR LISTING',
    driveMoreSales: 'Drive sales by boosting your listing into more visible positions.',
    general: 'General',
    priority: 'Priority',
    moreVisibility100: '100% more visibility, on average.',
    moreVisibility200: '200% more visibility, on average.',
    basicAccess: 'Basic access to ad placements across eBay',
    payPerSale: 'Pay per sale - only pay a fee when an item sells',
    accelerateSales: 'Accelerate sales on any type of listing, especially useful on low quantity listings',
    preferentialRanking: 'Preferential ranking in ad placements across eBay',
    payPerClick: 'Pay per click - only pay for clicks on your ads',
    multiplySales: 'Multiply sales on multi-quantity listings, especially useful in highly competitive categories',
    helpMeChoose: 'Help me choose',
    charity: 'CHARITY',
    listForFree: 'List it for free.',
    finalValueFee: 'A final value fee applies when your item sells.',
    cancel: 'Cancel',
    listIt: 'List it',
    saveForLater: 'Save for later',
    preview: 'Preview',
    // Item Specifics options
    canon: 'Canon',
    enterNumber: 'Enter number',
    enterYourOwn: 'Enter your own',
    silver: 'Silver',
    black: 'Black',
    gray: 'Gray',
    manual: 'Manual',
    auto: 'Auto',
    autoManual: 'Auto & Manual',
    compact: 'Compact',
    mm35: '35 mm',
    mm50: '50 mm',
    aps: 'APS',
    unit: 'Unit',
    japan: 'Japan',
    taiwan: 'Taiwan',
    china: 'China',
    s1980: '1980s',
    s1970: '1970s',
    s1960: '1960s',
    month1: '1 Month',
    year1: '1 Year'
  },
  ja: {
    title: 'eBay出品',
    languageToggle: '言語',
    photosVideo: '写真・動画',
    photosVideoDesc: '最大24枚の写真と1分間の動画を追加できます。購入者は詳細と全ての角度を見たがります。',
    dragDropFiles: 'ファイルをドラッグ&ドロップ',
    uploadFromComputer: 'コンピューターからアップロード',
    itemTitle: 'タイトル',
    itemTitleLabel: 'アイテムタイトル',
    subtitle: 'サブタイトル（オプション）',
    customLabel: 'カスタムラベル（SKU）',
    itemCategory: 'アイテムカテゴリ',
    filmCameras: 'フィルムカメラ',
    cameraPhoto: 'カメラ・写真 > フィルム写真',
    storeCategory: 'ストアカテゴリ',
    itemSpecifics: 'アイテム詳細',
    required: '必須',
    buyersNeed: '購入者がアイテムを見つけるためにこれらの詳細が必要です。',
    brand: 'ブランド',
    type: 'タイプ',
    model: 'モデル',
    upc: 'UPC',
    format: 'フォーマット',
    color: '色',
    focusType: 'フォーカスタイプ',
    series: 'シリーズ',
    features: '機能',
    mpn: 'MPN',
    unitQuantity: '単位数量',
    unitType: '単位タイプ',
    countryManufacture: '製造国・地域',
    yearManufactured: '製造年',
    warranty: 'メーカー保証',
    itemWeight: 'アイテム重量',
    californiaProp65: 'カリフォルニア州プロポジション65警告',
    itemHeight: 'アイテム高さ',
    itemLength: 'アイテム長さ',
    itemWidth: 'アイテム幅',
    addCustom: 'カスタム項目を追加',
    showLess: '表示を減らす',
    variations: 'バリエーション',
    variationsDesc: '複数のバリエーションを1つの固定価格リストに掲載することで時間とお金を節約できます。',
    condition: '状態',
    itemCondition: 'アイテムの状態',
    used: '中古',
    conditionDescription: '状態の説明',
    description: '説明',
    writeDescription: 'アイテムの詳細な説明を記述するか、時間を節約してAIに下書きを作成させてください',
    useAiDescription: 'AI説明を使用',
    pricing: '価格設定',
    formatLabel: 'フォーマット',
    buyItNow: '今すぐ購入',
    itemPrice: 'アイテム価格',
    quantity: '数量',
    paymentPolicy: '支払いポリシー',
    allowOffers: 'オファーを許可',
    buyersInterested: 'あなたのアイテムに興味のある購入者はオファーを出すことができます。受諾、カウンター、または拒否することができます。',
    minimumOffer: '最低オファー（オプション）',
    autoAccept: '自動受諾（オプション）',
    scheduleYourListing: 'リスティングのスケジュール',
    listingGoesLive: '時間と日付を選択しない限り、リスティングは即座に公開されます。',
    promoteYourListing: 'リスティング促進',
    driveMoreSales: 'リスティングをより見やすい位置に押し上げることで売上を促進します。',
    general: '一般',
    priority: '優先',
    moreVisibility100: '平均して100%多くの可視性。',
    moreVisibility200: '平均して200%多くの可視性。',
    basicAccess: 'eBay全体の広告配置への基本アクセス',
    payPerSale: '売上毎に支払い - アイテムが売れた時のみ手数料を支払う',
    accelerateSales: '任意のタイプのリスティングで売上を加速、特に少量リスティングに有用',
    preferentialRanking: 'eBay全体の広告配置で優先ランキング',
    payPerClick: 'クリック毎に支払い - あなたの広告のクリックのみに支払う',
    multiplySales: '複数数量リスティングで売上を倍増、特に競争の激しいカテゴリで有用',
    helpMeChoose: '選択の手助け',
    charity: 'チャリティ',
    listForFree: '無料で出品。',
    finalValueFee: 'アイテムが売れた時に最終価値手数料が適用されます。',
    cancel: 'キャンセル',
    listIt: '出品する',
    saveForLater: '後で保存',
    preview: 'プレビュー',
    // Item Specifics options
    canon: 'Canon',
    enterNumber: '番号を入力',
    enterYourOwn: '独自に入力',
    silver: 'シルバー',
    black: 'ブラック',
    gray: 'グレー',
    manual: 'マニュアル',
    auto: 'オート',
    autoManual: 'オート・マニュアル',
    compact: 'コンパクト',
    mm35: '35 mm',
    mm50: '50 mm',
    aps: 'APS',
    unit: 'ユニット',
    japan: '日本',
    taiwan: '台湾',
    china: '中国',
    s1980: '1980年代',
    s1970: '1970年代',
    s1960: '1960年代',
    month1: '1ヶ月',
    year1: '1年'
  }
};

export default function ListingFormModal({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}: ListingFormModalProps) {
  const { showToast } = useToast();
  
  // 言語設定
  const [language, setLanguage] = useState<'en' | 'ja'>('en');
  const t = translations[language];
  
  // フォーム状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Photos & Video
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  
  // Title
  const [itemTitle, setItemTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  
  // Item Category
  const [category, setCategory] = useState('film-cameras');
  const [storeCategory, setStoreCategory] = useState('film-camera');
  
  // Item Specifics
  const [brand, setBrand] = useState('Canon');
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [upc, setUpc] = useState('');
  const [format, setFormat] = useState('35 mm');
  const [color, setColor] = useState('Silver');
  const [focusType, setFocusType] = useState('Manual');
  const [series, setSeries] = useState('Compact');
  const [features, setFeatures] = useState('');
  const [mpn, setMpn] = useState('');
  const [unitQuantity, setUnitQuantity] = useState('');
  const [unitType, setUnitType] = useState('Unit');
  const [countryManufacture, setCountryManufacture] = useState('Japan');
  const [yearManufactured, setYearManufactured] = useState('1980s');
  const [warranty, setWarranty] = useState('1 Month');
  const [itemWeight, setItemWeight] = useState('');
  const [californiaProp65, setCaliforniaProp65] = useState('');
  const [itemHeight, setItemHeight] = useState('');
  const [itemLength, setItemLength] = useState('');
  const [itemWidth, setItemWidth] = useState('');
  const [showLessSpecifics, setShowLessSpecifics] = useState(false);
  
  // Condition
  const [condition, setCondition] = useState('Used');
  const [conditionDescription, setConditionDescription] = useState('');
  
  // Description
  const [description, setDescription] = useState('');
  
  // Pricing
  const [formatType, setFormatType] = useState('Buy It Now');
  const [itemPrice, setItemPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentPolicy, setPaymentPolicy] = useState('PayPal [57 listings]');
  const [allowOffers, setAllowOffers] = useState(true);
  const [minimumOffer, setMinimumOffer] = useState(0);
  const [autoAccept, setAutoAccept] = useState(0);
  const [scheduleYourListing, setScheduleYourListing] = useState(false);
  
  // Promotion
  const [generalPromotion, setGeneralPromotion] = useState(false);
  const [priorityPromotion, setPriorityPromotion] = useState(false);

  // 商品変更時の初期化
  useEffect(() => {
    if (product) {
      setItemTitle(product.name);
      setCustomLabel(product.sku);
      setItemPrice(product.price);
      setCondition(product.condition);
      setDescription(product.description || '');
    }
  }, [product]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 24));
  };

  const handleSubmit = async () => {
    if (!product) {
      setError('Product information is missing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const listingData = {
        productId: product.id,
        // Photos & Video
        photos: photos,
        video: video,
        // Title
        title: itemTitle,
        subtitle: subtitle,
        customLabel: customLabel,
        // Category
        category: category,
        storeCategory: storeCategory,
        // Item Specifics
        brand: brand,
        type: type,
        model: model,
        upc: upc,
        format: format,
        color: color,
        focusType: focusType,
        series: series,
        features: features,
        mpn: mpn,
        unitQuantity: unitQuantity,
        unitType: unitType,
        countryManufacture: countryManufacture,
        yearManufactured: yearManufactured,
        warranty: warranty,
        itemWeight: itemWeight,
        californiaProp65: californiaProp65,
        itemHeight: itemHeight,
        itemLength: itemLength,
        itemWidth: itemWidth,
        // Condition
        condition: condition,
        conditionDescription: conditionDescription,
        // Description
        description: description,
        // Pricing
        formatType: formatType,
        price: itemPrice,
        quantity: quantity,
        paymentPolicy: paymentPolicy,
        allowOffers: allowOffers,
        minimumOffer: minimumOffer,
        autoAccept: autoAccept,
        scheduleYourListing: scheduleYourListing,
        // Promotion
        generalPromotion: generalPromotion,
        priorityPromotion: priorityPromotion
      };

      const response = await fetch('/api/ebay/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Listing failed');
      }

      const result = await response.json();

      showToast({
        title: language === 'ja' ? '出品完了' : 'Listing Complete',
        message: language === 'ja' 
          ? `${product.name} をeBayに出品しました` 
          : `${product.name} has been listed on eBay`,
        type: 'success'
      });

      if (onSuccess) {
        onSuccess(result);
      }

      onClose();

    } catch (error: any) {
      console.error('Listing error:', error);
      setError(error.message || 'An error occurred during listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.title}
      size="xl"
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {/* Language Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="w-4 h-4" />
            <span className="text-sm">{t.languageToggle}:</span>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                language === 'en' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                language === 'ja' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              日本語
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* PHOTOS & VIDEO */}
          <section>
            <h3 className="text-lg font-semibold mb-2">{t.photosVideo}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.photosVideoDesc}</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">{photos.length}/25</p>
              <p className="text-gray-500 mb-4">{t.dragDropFiles}</p>
              <label className="inline-block">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  {t.uploadFromComputer}
                </span>
              </label>
            </div>
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-6 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded border">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* TITLE */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t.itemTitle}</h3>
            <div className="space-y-4">
              <div>
                <NexusInput
                  label={t.itemTitleLabel}
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder={product?.name}
                  maxLength={80}
                />
                <p className="text-xs text-gray-500 mt-1">{itemTitle.length}/80</p>
              </div>
              <div>
                <NexusInput
                  label={`${t.subtitle} — $2.20`}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  maxLength={55}
                />
                <p className="text-xs text-gray-500 mt-1">{subtitle.length}/55</p>
              </div>
              <div>
                <NexusInput
                  label={t.customLabel}
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={product?.sku}
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{customLabel.length}/50</p>
              </div>
            </div>
          </section>

          {/* ITEM CATEGORY */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t.itemCategory}</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">{t.filmCameras}</p>
                <p className="text-sm text-gray-600">{t.cameraPhoto}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.storeCategory}</label>
                <NexusSelect
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  options={[
                    { value: 'film-camera', label: 'film camera' }
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ITEM SPECIFICS */}
          <section>
            <h3 className="text-lg font-semibold mb-2">{t.itemSpecifics}</h3>
            <div className="mb-4">
              <p className="text-sm font-medium">{t.required}</p>
              <p className="text-sm text-gray-600">{t.buyersNeed}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NexusSelect
                label={t.brand}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                options={[
                  { value: 'Canon', label: t.canon }
                ]}
              />
              <NexusSelect
                label={t.type}
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: '', label: '' }
                ]}
              />
              <NexusSelect
                label={t.model}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={[
                  { value: '', label: '' }
                ]}
              />
              <NexusInput
                label={t.upc}
                value={upc}
                onChange={(e) => setUpc(e.target.value)}
                placeholder={t.enterNumber}
              />
              <NexusSelect
                label={`${t.format} — ~196K searches`}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={[
                  { value: '35 mm', label: t.mm35 },
                  { value: '50 mm', label: t.mm50 },
                  { value: 'APS', label: t.aps }
                ]}
              />
              <NexusSelect
                label={`${t.color} — ~62K searches`}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                options={[
                  { value: 'Silver', label: t.silver },
                  { value: 'Black', label: t.black },
                  { value: 'Gray', label: t.gray }
                ]}
              />
              <NexusSelect
                label={`${t.focusType} — ~33.2K searches`}
                value={focusType}
                onChange={(e) => setFocusType(e.target.value)}
                options={[
                  { value: 'Manual', label: t.manual },
                  { value: 'Auto', label: t.auto },
                  { value: 'Auto & Manual', label: t.autoManual }
                ]}
              />
              <NexusSelect
                label={`${t.series} — Trending`}
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                options={[
                  { value: 'Compact', label: t.compact }
                ]}
              />
              <NexusSelect
                label={`${t.features} — Trending`}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                options={[
                  { value: '', label: '' }
                ]}
              />
              <NexusSelect
                label={t.mpn}
                value={mpn}
                onChange={(e) => setMpn(e.target.value)}
                options={[
                  { value: '', label: '' }
                ]}
              />
              <NexusInput
                label={t.unitQuantity}
                value={unitQuantity}
                onChange={(e) => setUnitQuantity(e.target.value)}
                placeholder={t.enterYourOwn}
              />
              <NexusSelect
                label={t.unitType}
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                options={[
                  { value: 'Unit', label: t.unit }
                ]}
              />
              <NexusSelect
                label={`${t.countryManufacture} — ~12.7K searches`}
                value={countryManufacture}
                onChange={(e) => setCountryManufacture(e.target.value)}
                options={[
                  { value: 'Japan', label: t.japan },
                  { value: 'Taiwan', label: t.taiwan },
                  { value: 'China', label: t.china }
                ]}
              />
              <NexusSelect
                label={`${t.yearManufactured} — ~564 searches`}
                value={yearManufactured}
                onChange={(e) => setYearManufactured(e.target.value)}
                options={[
                  { value: '1980s', label: t.s1980 },
                  { value: '1970s', label: t.s1970 },
                  { value: '1960s', label: t.s1960 }
                ]}
              />
              <NexusSelect
                label={t.warranty}
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                options={[
                  { value: '1 Month', label: t.month1 },
                  { value: '1 Year', label: t.year1 }
                ]}
              />
              {!showLessSpecifics && (
                <>
                  <NexusInput
                    label={t.itemWeight}
                    value={itemWeight}
                    onChange={(e) => setItemWeight(e.target.value)}
                    placeholder={t.enterYourOwn}
                  />
                  <NexusTextarea
                    label={t.californiaProp65}
                    value={californiaProp65}
                    onChange={(e) => setCaliforniaProp65(e.target.value)}
                    placeholder={t.enterYourOwn}
                    rows={2}
                  />
                  <NexusInput
                    label={t.itemHeight}
                    value={itemHeight}
                    onChange={(e) => setItemHeight(e.target.value)}
                    placeholder={t.enterYourOwn}
                  />
                  <NexusInput
                    label={t.itemLength}
                    value={itemLength}
                    onChange={(e) => setItemLength(e.target.value)}
                    placeholder={t.enterYourOwn}
                  />
                  <NexusInput
                    label={t.itemWidth}
                    value={itemWidth}
                    onChange={(e) => setItemWidth(e.target.value)}
                    placeholder={t.enterYourOwn}
                  />
                </>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                {t.addCustom}
              </button>
              <button
                type="button"
                onClick={() => setShowLessSpecifics(!showLessSpecifics)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                {showLessSpecifics ? <PlusIcon className="w-4 h-4 mr-1" /> : <MinusIcon className="w-4 h-4 mr-1" />}
                {t.showLess}
              </button>
            </div>
          </section>

          {/* VARIATIONS */}
          <section>
            <h3 className="text-lg font-semibold mb-2">{t.variations}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.variationsDesc}</p>
          </section>

          {/* CONDITION */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t.condition}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.itemCondition}</label>
                <div className="text-sm font-medium">{t.used}</div>
              </div>
              <div>
                <NexusTextarea
                  label={t.conditionDescription}
                  value={conditionDescription}
                  onChange={(e) => setConditionDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{conditionDescription.length}/1000</p>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t.description}</h3>
            <div className="space-y-4">
              <NexusTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.writeDescription}
                rows={8}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">{description.length}/1000</p>
              <button
                type="button"
                className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {t.useAiDescription}
              </button>
            </div>
          </section>

          {/* PRICING */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t.pricing}</h3>
            <div className="space-y-4">
              <NexusSelect
                label={t.formatLabel}
                value={formatType}
                onChange={(e) => setFormatType(e.target.value)}
                options={[
                  { value: 'Buy It Now', label: t.buyItNow }
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NexusInput
                  label={t.itemPrice}
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  placeholder="$"
                />
                <NexusInput
                  label={t.quantity}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                />
              </div>
              <NexusSelect
                label={t.paymentPolicy}
                value={paymentPolicy}
                onChange={(e) => setPaymentPolicy(e.target.value)}
                options={[
                  { value: 'PayPal [57 listings]', label: 'PayPal [57 listings]' }
                ]}
              />
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium">{t.allowOffers}</div>
                  <div className="text-sm text-gray-600">{t.buyersInterested}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowOffers(!allowOffers)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    allowOffers ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowOffers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {allowOffers && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NexusInput
                    label={t.minimumOffer}
                    type="number"
                    value={minimumOffer}
                    onChange={(e) => setMinimumOffer(Number(e.target.value))}
                    placeholder="$"
                  />
                  <NexusInput
                    label={t.autoAccept}
                    type="number"
                    value={autoAccept}
                    onChange={(e) => setAutoAccept(Number(e.target.value))}
                    placeholder="$"
                  />
                </div>
              )}
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium">{t.scheduleYourListing}</div>
                  <div className="text-sm text-gray-600">{t.listingGoesLive}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleYourListing(!scheduleYourListing)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    scheduleYourListing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      scheduleYourListing ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* PROMOTE YOUR LISTING */}
          <section>
            <h3 className="text-lg font-semibold mb-2">{t.promoteYourListing}</h3>
            <p className="text-sm text-gray-600 mb-6">{t.driveMoreSales}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{t.general}</h4>
                  <button
                    type="button"
                    onClick={() => setGeneralPromotion(!generalPromotion)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      generalPromotion ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        generalPromotion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-green-600 font-medium text-sm mb-2">▲ {t.moreVisibility100}</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ {t.basicAccess}</li>
                  <li>✓ {t.payPerSale}</li>
                  <li>✓ {t.accelerateSales}</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{t.priority}</h4>
                  <button
                    type="button"
                    onClick={() => setPriorityPromotion(!priorityPromotion)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      priorityPromotion ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        priorityPromotion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-green-600 font-medium text-sm mb-2">▲ {t.moreVisibility200}</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ {t.preferentialRanking}</li>
                  <li>✓ {t.payPerClick}</li>
                  <li>✓ {t.multiplySales}</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-4">
              <button type="button" className="text-sm text-blue-600 hover:text-blue-800 underline">
                ⓘ {t.helpMeChoose}
              </button>
            </div>
          </section>

          {/* CHARITY */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t.charity}</h3>
          </section>
        </div>

        {/* Final section */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold mb-2">{t.listForFree}</h3>
          <p className="text-sm text-gray-600 mb-6">{t.finalValueFee}</p>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <NexusButton
            onClick={handleSubmit}
            variant="primary"
            icon={<ShoppingCartIcon className="w-4 h-4" />}
            disabled={!itemTitle || isSubmitting}
            className="px-8 py-3"
          >
            {isSubmitting ? (language === 'ja' ? '出品中...' : 'Listing...') : t.listIt}
          </NexusButton>
          <NexusButton
            onClick={() => {}}
            className="px-8 py-3"
          >
            {t.saveForLater}
          </NexusButton>
          <NexusButton
            onClick={() => {}}
            className="px-8 py-3"
          >
            {t.preview}
          </NexusButton>
        </div>
      </div>
    </BaseModal>
  );
}
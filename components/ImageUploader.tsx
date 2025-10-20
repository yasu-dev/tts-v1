'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadedImage {
  id: string
  url: string
  type: 'wound' | 'scene' | 'body_diagram' | 'other'
  compressed_size: number
  taken_at: string
}

interface ImageUploaderProps {
  tagId: string
  onUploadComplete: (images: UploadedImage[]) => void
}

export default function ImageUploader({ tagId, onUploadComplete }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const MAX_IMAGES = 5

  const compressImage = async (file: File): Promise<{ blob: Blob; size: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // リサイズ（最大1920px）
          const maxSize = 1920
          if (width > height && width > maxSize) {
            height *= maxSize / width
            width = maxSize
          } else if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              resolve({ blob: blob!, size: blob!.size })
            },
            'image/jpeg',
            0.8 // 80%品質
          )
        }
      }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > MAX_IMAGES) {
      alert(`画像は最大${MAX_IMAGES}枚までアップロードできます`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const uploadedImages: UploadedImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 画像ファイルかチェック
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} は画像ファイルではありません`)
        continue
      }

      // 圧縮
      const { blob, size } = await compressImage(file)

      // ファイル名生成
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `${tagId}/${timestamp}_${i}.jpg`

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from('triage-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        alert(`${file.name} のアップロードに失敗しました`)
        continue
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('triage-images')
        .getPublicUrl(fileName)

      const uploadedImage: UploadedImage = {
        id: `${tagId}_${timestamp}_${i}`,
        url: urlData.publicUrl,
        type: 'other', // デフォルト値
        compressed_size: size,
        taken_at: new Date().toISOString(),
      }

      uploadedImages.push(uploadedImage)
      setUploadProgress(((i + 1) / files.length) * 100)
    }

    const newImages = [...images, ...uploadedImages]
    setImages(newImages)
    onUploadComplete(newImages)
    setUploading(false)
    setUploadProgress(0)

    // input要素をリセット
    e.target.value = ''
  }

  const handleTypeChange = (index: number, type: UploadedImage['type']) => {
    const updatedImages = [...images]
    updatedImages[index].type = type
    setImages(updatedImages)
    onUploadComplete(updatedImages)
  }

  const handleDelete = async (index: number) => {
    if (!confirm('この画像を削除しますか？')) return

    const imageToDelete = images[index]

    // URLからファイルパスを抽出
    const url = new URL(imageToDelete.url)
    const pathSegments = url.pathname.split('/')
    const fileName = pathSegments.slice(-2).join('/') // tagId/filename

    // Supabase Storageから削除
    const { error } = await supabase.storage
      .from('triage-images')
      .remove([fileName])

    if (error) {
      alert('画像の削除に失敗しました')
      return
    }

    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onUploadComplete(updatedImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {images.length} / {MAX_IMAGES}枚
        </span>
      </div>

      <p className="text-sm text-gray-600">
        外傷部位、現場写真などをカメラで撮影して即座にアップロードします（最大{MAX_IMAGES}枚）
      </p>

      {/* カメラ撮影ボタン */}
      {images.length < MAX_IMAGES && (
        <div>
          <label className="btn-primary inline-block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? 'アップロード中...' : 'カメラで撮影'}
          </label>
        </div>
      )}

      {/* アップロード進捗 */}
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* 画像プレビュー */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="border border-gray-300 rounded-lg p-3 space-y-2"
            >
              <img
                src={image.url}
                alt={`アップロード画像 ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />

              <select
                value={image.type}
                onChange={(e) => handleTypeChange(index, e.target.value as UploadedImage['type'])}
                className="input text-sm"
              >
                <option value="wound">外傷部位</option>
                <option value="scene">現場写真</option>
                <option value="body_diagram">身体図</option>
                <option value="other">その他</option>
              </select>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {(image.compressed_size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
        <p className="text-xs text-gray-700">
          <strong>注意:</strong>
          <br />• 撮影後、即座にクラウドにアップロードされます（デバイスには保存されません）
          <br />• 画像は自動的に圧縮されます（最大1920px、JPEG品質80%）
        </p>
      </div>
    </div>
  )
}

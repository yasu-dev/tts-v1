'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createLogger } from '@/lib/utils/logger'

// Leaflet のデフォルトアイコン修正（Next.jsでの問題対応）
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface PatientMarker {
  id: string
  position: [number, number]
  category: 'black' | 'red' | 'yellow' | 'green'
  tagNumber: string
  anonymousId: string
}

interface TriageMapProps {
  patients: PatientMarker[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (patientId: string) => void
}

export default function TriageMap({
  patients,
  center = [35.6895, 139.6917], // デフォルト: 東京消防庁本部付近
  zoom = 13,
  onMarkerClick,
}: TriageMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const logger = createLogger('components/TriageMap')

  useEffect(() => {
    setIsMounted(true)
    logger.debug('Mounted', { patients: patients.length })
  }, [])

  // カテゴリー別の色設定
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'black':
        return '#000000'
      case 'red':
        return '#ef4444'
      case 'yellow':
        return '#eab308'
      case 'green':
        return '#22c55e'
      default:
        return '#6b7280'
    }
  }

  // カテゴリー別のカスタムアイコン作成
  const createCategoryIcon = (category: string) => {
    const color = getCategoryColor(category)
    const svgIcon = `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 26 16 26s16-17.2 16-26C32 7.2 24.8 0 16 0z"
              fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `
    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    })
  }

  // カテゴリー別のラベル
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'black':
        return '⚫ 黒（死亡）'
      case 'red':
        return '🔴 赤（重症）'
      case 'yellow':
        return '🟡 黄（中等症）'
      case 'green':
        return '🟢 緑（軽症）'
      default:
        return '不明'
    }
  }

  // サーバーサイドレンダリング時はローディング表示
  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-600">地図を読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {patients.map((patient) => (
          <Marker
            key={patient.id}
            position={patient.position}
            icon={createCategoryIcon(patient.category)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  logger.info('Marker clicked', { id: patient.id })
                  onMarkerClick(patient.id)
                }
              },
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-lg mb-2">{getCategoryLabel(patient.category)}</p>
                <p className="text-sm">
                  <strong>タグ番号:</strong> {patient.tagNumber}
                </p>
                <p className="text-sm">
                  <strong>匿名ID:</strong> {patient.anonymousId}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  位置: {patient.position[0].toFixed(6)}, {patient.position[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 中心点に円を表示（活動範囲の目安） */}
        <Circle
          center={center}
          radius={1000}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
          }}
        />
      </MapContainer>
    </div>
  )
}

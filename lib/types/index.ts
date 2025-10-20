// lib/types/index.ts

// ===== 災害イベント =====
export interface Event {
  id: string
  name: string
  occurred_at: string
  closed_at: string | null
  location_polygon: any | null
  command_post_location: {
    lat: number
    lng: number
  } | null
  communication_mode: 'normal' | 'satellite' | 'mesh' | 'offline'
  status: 'preparing' | 'active' | 'closing' | 'archived'
  contact_points?: string[]  // 接触地点リスト（例：["バスの右前方", "対向車線", "歩道側"]）
  created_by: string
  created_at: string
  updated_at: string
}

// ===== トリアージタグ =====
export interface TriageTag {
  id: string
  event_id: string
  anonymous_id: string
  tag_number: string
  
  patient_info?: {
    name?: string
    age?: number
    sex?: 'male' | 'female' | 'other' | 'unknown'
    height?: number
    weight?: number
    address?: string
    phone?: string
  }
  
  location: {
    latitude: number
    longitude: number
    altitude?: number
    accuracy: number
    method: 'gps' | 'wifi' | 'manual' | 'estimated'
    address?: string
    area_grid?: string
    contact_point?: string  // 発見された接触地点（例："バスの右前方"）
    timestamp: string
  }
  
  vital_signs: {
    respiratory_rate?: number
    respiratory_status: 'normal' | 'abnormal' | 'stopped'
    pulse_rate?: number
    heart_rate?: number
    radial_pulse_palpable?: boolean
    crt?: number
    consciousness: {
      avpu: 'alert' | 'voice' | 'pain' | 'unresponsive'
      jcs?: number
      gcs?: {
        eye: number
        verbal: number
        motor: number
      }
    }
    consciousness_level?: string
    spo2?: number
    blood_pressure?: {
      systolic: number
      diastolic: number
    } | string
    temperature?: number
    trauma_assessment?: string
    bleeding_evaluation?: 'none' | 'minor' | 'moderate' | 'severe'
    measured_at: string
  }

  chief_complaint?: {
    primary: string
    symptoms?: string[]
    notes?: string
  }

  triage_category: {
    ai_suggested: 'black' | 'red' | 'yellow' | 'green'
    ai_confidence: number
    ai_reasoning: string
    final: 'black' | 'red' | 'yellow' | 'green'
    final_decided_by: string
    final_decided_at: string
    reasoning?: string
    override_reason?: string
    start_steps: {
      can_walk: boolean | null
      breathing?: boolean | null
      circulation?: boolean | null
      consciousness?: boolean | null
      has_respiration: boolean | null
      respiratory_rate_range: '0' | '<10' | '10-29' | '>=30' | null
      radial_pulse: boolean | null
      follows_commands: boolean | null
    }
  }
  
  retriage_history: Array<{
    from: 'black' | 'red' | 'yellow' | 'green'
    to: 'black' | 'red' | 'yellow' | 'green'
    reason: string
    changed_by: string
    changed_at: string
  }>
  
  attachments: {
    images: Array<{
      id: string
      url: string
      type: 'wound' | 'scene' | 'body_diagram' | 'other'
      compressed_size: number
      thumbnail_url?: string
      taken_at: string
      location?: { lat: number; lng: number }
    }>
    audio_notes: Array<{
      id: string
      url: string
      transcription: string
      duration: number
      recorded_at: string
    }>
    drone_images?: Array<{
      id: string
      url: string
      analysis_result?: {
        detected_posture: 'lying' | 'sitting' | 'standing'
        bounding_box: { x: number; y: number; width: number; height: number }
      }
    }>
  }
  
  treatments: Array<{
    type: 'hemostasis' | 'airway' | 'fixation' | 'oxygen' | 'other'
    description: string
    performed_by: string
    performed_at: string
  }>
  
  transport: {
    status: 'not_transported' | 'preparing' | 'waiting' | 'in_transit' | 'arrived' | 'admitted' | 'completed'
    team_id?: string
    vehicle_id?: string
    destination?: {
      hospital_id: string
      hospital_name: string
      department: string
      eta?: string
    }
    departure_time?: string
    arrival_time?: string
    transport_duration?: number
    vital_changes_during_transport?: Array<{
      vital_signs: TriageTag['vital_signs']
      timestamp: string
    }>
  }
  
  transport_assignment?: {
    team: string
    status: 'assigned' | 'in_progress' | 'completed'
    assigned_at: string
    updated_at?: string
  }
  
  outcome?: {
    diagnosis: string
    treatments_performed: string[]
    admission_ward?: string
    discharge_date?: string
    final_outcome: 'recovered' | 'admitted' | 'transferred' | 'deceased'
  }
  
  audit: {
    created_by: string
    created_at: string
    created_device_id: string
    updated_by: string
    updated_at: string
    updated_device_id: string
    version: number
    revision_history: Array<{
      version: number
      diff: object
      changed_by: string
      changed_at: string
      change_reason?: string
    }>
  }
  
  created_at: string
  updated_at: string
}

// ===== 地理エリア =====
export interface GeographicArea {
  id: string
  event_id: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  priority_score: number
  estimated_casualty_count: number
  severity_distribution: {
    red: number
    yellow: number
    green: number
    black: number
  }
  drone_analysis?: {
    image_url: string
    analyzed_at: string
    detected_persons: number
    heatmap_url?: string
  }
  assigned_team_ids: string[]
  updated_at: string
}

// ===== 医療機関 =====
export interface Hospital {
  id: string
  name: string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  contact: {
    phone: string
    emergency_phone?: string
    email?: string
  }
  capabilities: {
    departments: Array<{
      name: string
      available_beds: number
      occupied_beds: number
      specialties: string[]
    }>
    has_er: boolean
    has_icu: boolean
    has_heliport: boolean
  }
  current_load: {
    total_capacity: number
    current_patients: number
    accepting_status: 'accepting' | 'limited' | 'full'
    last_updated: string
  }
  transport_count: number
  created_at: string
  updated_at: string
}

// ===== 隊/車両 =====
export interface Team {
  id: string
  event_id: string
  type: 'triage' | 'transport' | 'dmat' | 'fire' | 'police'
  name: string
  members: Array<{
    user_id: string
    role: 'leader' | 'member'
  }>
  current_location?: {
    latitude: number
    longitude: number
    accuracy: number
    updated_at: string
  }
  status: 'standby' | 'moving' | 'active' | 'resting' | 'out_of_service'
  assigned_area_ids: string[]
  assigned_casualty_ids: string[]
  vehicle?: {
    id: string
    type: 'ambulance' | 'fire_truck' | 'command_vehicle'
    license_plate: string
  }
  activity_log: Array<{
    action: 'arrived' | 'started_triage' | 'completed_triage' | 'departed'
    location?: { lat: number; lng: number }
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

// ===== ユーザーロール =====
export interface UserRole {
  id: string
  user_id: string
  event_id: string
  role: 'IC' | 'TRI' | 'TRN' | 'HSP' | 'DMAT' | 'AUD' | 'ADM'
  assigned_area_ids: string[]
  created_at: string
}

// ===== ロール名の日本語表示 =====
export const RoleNames: Record<UserRole['role'], string> = {
  IC: '指揮本部',
  TRI: 'タッグ付け部隊',
  TRN: '搬送部隊',
  HSP: '医療機関',
  DMAT: 'DMAT',
  AUD: '監査担当',
  ADM: 'システム管理者',
}

// ===== トリアージ区分の色とラベル =====
export const TriageCategories = {
  black: { label: '黒（死亡）', color: 'bg-black', textColor: 'text-white' },
  red: { label: '赤（重症）', color: 'bg-red-500', textColor: 'text-white' },
  yellow: { label: '黄（中等症）', color: 'bg-yellow-400', textColor: 'text-gray-900' },
  green: { label: '緑（軽症）', color: 'bg-green-500', textColor: 'text-white' },
} as const

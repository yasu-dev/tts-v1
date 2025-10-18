-- デモデータ投入スクリプト for Triage Tag System
-- 実行順序: 1. schema.sql → 2. rls-policies.sql → 3. demo-data.sql

-- ===== 既存データのクリア（開発環境のみ） =====
-- TRUNCATE TABLE triage_tags CASCADE;
-- TRUNCATE TABLE events CASCADE;
-- TRUNCATE TABLE hospitals CASCADE;
-- TRUNCATE TABLE teams CASCADE;
-- TRUNCATE TABLE geographic_areas CASCADE;
-- TRUNCATE TABLE user_roles CASCADE;

-- ===== 1. イベント（災害） =====
INSERT INTO events (id, name, occurred_at, location_polygon, command_post_location, communication_mode, status, created_by, created_at, updated_at)
VALUES
  (
    'event-001',
    '2025年 東京都内大規模地震',
    '2025-10-18T09:15:00+09:00',
    NULL,
    '{"lat": 35.6895, "lng": 139.6917}'::jsonb,
    'normal',
    'active',
    'system',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ===== 2. 医療機関 =====
INSERT INTO hospitals (id, name, location, contact, capabilities, current_load, transport_count, created_at, updated_at)
VALUES
  -- 総合病院A（救命救急センター）
  (
    'hospital-001',
    '東京総合病院',
    '{
      "address": "東京都千代田区丸の内1-1-1",
      "latitude": 35.6812,
      "longitude": 139.7671
    }'::jsonb,
    '{
      "phone": "03-1234-5678",
      "emergency_phone": "03-1234-9999",
      "email": "emergency@tokyo-general.jp"
    }'::jsonb,
    '{
      "departments": [
        {"name": "救急科", "available_beds": 20, "occupied_beds": 15, "specialties": ["外傷", "内科救急"]},
        {"name": "外科", "available_beds": 30, "occupied_beds": 25, "specialties": ["一般外科", "整形外科"]},
        {"name": "ICU", "available_beds": 10, "occupied_beds": 8, "specialties": ["集中治療"]}
      ],
      "has_er": true,
      "has_icu": true,
      "has_heliport": true
    }'::jsonb,
    '{
      "total_capacity": 200,
      "current_patients": 150,
      "accepting_status": "accepting",
      "last_updated": "2025-10-18T10:00:00+09:00"
    }'::jsonb,
    5,
    NOW(),
    NOW()
  ),
  -- 市民病院B
  (
    'hospital-002',
    '中央市民病院',
    '{
      "address": "東京都新宿区西新宿2-8-1",
      "latitude": 35.6897,
      "longitude": 139.6922
    }'::jsonb,
    '{
      "phone": "03-2345-6789",
      "emergency_phone": "03-2345-9999",
      "email": "info@chuo-hospital.jp"
    }'::jsonb,
    '{
      "departments": [
        {"name": "救急科", "available_beds": 15, "occupied_beds": 12, "specialties": ["救急医療"]},
        {"name": "内科", "available_beds": 40, "occupied_beds": 35, "specialties": ["一般内科"]}
      ],
      "has_er": true,
      "has_icu": false,
      "has_heliport": false
    }'::jsonb,
    '{
      "total_capacity": 150,
      "current_patients": 120,
      "accepting_status": "limited",
      "last_updated": "2025-10-18T10:00:00+09:00"
    }'::jsonb,
    3,
    NOW(),
    NOW()
  ),
  -- 専門病院C
  (
    'hospital-003',
    '東都医療センター',
    '{
      "address": "東京都港区虎ノ門1-2-3",
      "latitude": 35.6684,
      "longitude": 139.7474
    }'::jsonb,
    '{
      "phone": "03-3456-7890",
      "emergency_phone": "03-3456-9999",
      "email": "contact@toto-medical.jp"
    }'::jsonb,
    '{
      "departments": [
        {"name": "外傷科", "available_beds": 25, "occupied_beds": 20, "specialties": ["外傷外科", "整形外科"]},
        {"name": "ICU", "available_beds": 8, "occupied_beds": 6, "specialties": ["集中治療"]}
      ],
      "has_er": true,
      "has_icu": true,
      "has_heliport": true
    }'::jsonb,
    '{
      "total_capacity": 100,
      "current_patients": 75,
      "accepting_status": "accepting",
      "last_updated": "2025-10-18T10:00:00+09:00"
    }'::jsonb,
    2,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ===== 3. トリアージタグ（デモ患者データ） =====

-- 患者1: 赤タグ（重症）- 搬送待ち
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-001',
  'event-001',
  'ANON-001',
  'T-2025-001',
  '{"age": 45, "sex": "male"}'::jsonb,
  '{
    "latitude": 35.6900,
    "longitude": 139.6930,
    "accuracy": 10,
    "method": "gps",
    "timestamp": "2025-10-18T09:30:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 35,
    "respiratory_status": "abnormal",
    "pulse_rate": 120,
    "radial_pulse_palpable": true,
    "consciousness": {"avpu": "pain"},
    "spo2": 88,
    "blood_pressure": {"systolic": 85, "diastolic": 55},
    "measured_at": "2025-10-18T09:30:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "red",
    "ai_confidence": 0.95,
    "ai_reasoning": "呼吸数異常（35回/分）、低SpO2、意識レベル低下",
    "final": "red",
    "final_decided_by": "user-tri-001",
    "final_decided_at": "2025-10-18T09:32:00+09:00",
    "start_steps": {
      "can_walk": false,
      "has_respiration": true,
      "respiratory_rate_range": ">=30",
      "radial_pulse": true,
      "follows_commands": false
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[
    {
      "type": "oxygen",
      "description": "酸素投与 10L/分",
      "performed_by": "user-tri-001",
      "performed_at": "2025-10-18T09:35:00+09:00"
    }
  ]'::jsonb,
  '{
    "status": "waiting",
    "team_id": null,
    "vehicle_id": null
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-001",
    "created_at": "2025-10-18T09:32:00+09:00",
    "created_device_id": "device-001",
    "updated_by": "user-tri-001",
    "updated_at": "2025-10-18T09:35:00+09:00",
    "updated_device_id": "device-001",
    "version": 1,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 患者2: 赤タグ（重症）- 搬送中
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-002',
  'event-001',
  'ANON-002',
  'T-2025-002',
  '{"age": 32, "sex": "female"}'::jsonb,
  '{
    "latitude": 35.6885,
    "longitude": 139.6905,
    "accuracy": 15,
    "method": "gps",
    "timestamp": "2025-10-18T09:25:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 8,
    "respiratory_status": "abnormal",
    "pulse_rate": 50,
    "radial_pulse_palpable": false,
    "consciousness": {"avpu": "unresponsive"},
    "spo2": 82,
    "measured_at": "2025-10-18T09:25:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "red",
    "ai_confidence": 0.98,
    "ai_reasoning": "呼吸数低下、橈骨動脈触知不可、意識消失",
    "final": "red",
    "final_decided_by": "user-tri-001",
    "final_decided_at": "2025-10-18T09:27:00+09:00",
    "start_steps": {
      "can_walk": false,
      "has_respiration": true,
      "respiratory_rate_range": "<10",
      "radial_pulse": false,
      "follows_commands": false
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[
    {
      "type": "airway",
      "description": "気道確保",
      "performed_by": "user-tri-001",
      "performed_at": "2025-10-18T09:26:00+09:00"
    }
  ]'::jsonb,
  '{
    "status": "in_transit",
    "team_id": "team-trn-001",
    "vehicle_id": "ambulance-001",
    "destination": {
      "hospital_id": "hospital-001",
      "hospital_name": "東京総合病院",
      "department": "救急科"
    },
    "departure_time": "2025-10-18T09:40:00+09:00"
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-001",
    "created_at": "2025-10-18T09:27:00+09:00",
    "created_device_id": "device-001",
    "updated_by": "user-trn-001",
    "updated_at": "2025-10-18T09:40:00+09:00",
    "updated_device_id": "device-002",
    "version": 2,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 患者3: 黄タグ（中等症）
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-003',
  'event-001',
  'ANON-003',
  'T-2025-003',
  '{"age": 28, "sex": "male"}'::jsonb,
  '{
    "latitude": 35.6910,
    "longitude": 139.6945,
    "accuracy": 12,
    "method": "gps",
    "timestamp": "2025-10-18T09:40:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 22,
    "respiratory_status": "normal",
    "pulse_rate": 90,
    "radial_pulse_palpable": true,
    "consciousness": {"avpu": "alert"},
    "spo2": 96,
    "measured_at": "2025-10-18T09:40:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "yellow",
    "ai_confidence": 0.92,
    "ai_reasoning": "バイタル安定、意識清明、処置遅延可能",
    "final": "yellow",
    "final_decided_by": "user-tri-002",
    "final_decided_at": "2025-10-18T09:42:00+09:00",
    "start_steps": {
      "can_walk": false,
      "has_respiration": true,
      "respiratory_rate_range": "10-29",
      "radial_pulse": true,
      "follows_commands": true
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[
    {
      "type": "fixation",
      "description": "左前腕骨折 シーネ固定",
      "performed_by": "user-tri-002",
      "performed_at": "2025-10-18T09:43:00+09:00"
    }
  ]'::jsonb,
  '{
    "status": "waiting",
    "team_id": null,
    "vehicle_id": null
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-002",
    "created_at": "2025-10-18T09:42:00+09:00",
    "created_device_id": "device-003",
    "updated_by": "user-tri-002",
    "updated_at": "2025-10-18T09:43:00+09:00",
    "updated_device_id": "device-003",
    "version": 1,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 患者4: 黄タグ（中等症）- 搬送中
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-004',
  'event-001',
  'ANON-004',
  'T-2025-004',
  '{"age": 55, "sex": "female"}'::jsonb,
  '{
    "latitude": 35.6870,
    "longitude": 139.6880,
    "accuracy": 20,
    "method": "gps",
    "timestamp": "2025-10-18T09:20:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 20,
    "respiratory_status": "normal",
    "pulse_rate": 85,
    "radial_pulse_palpable": true,
    "consciousness": {"avpu": "alert"},
    "spo2": 95,
    "measured_at": "2025-10-18T09:20:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "yellow",
    "ai_confidence": 0.90,
    "ai_reasoning": "バイタル安定、意識清明",
    "final": "yellow",
    "final_decided_by": "user-tri-001",
    "final_decided_at": "2025-10-18T09:22:00+09:00",
    "start_steps": {
      "can_walk": false,
      "has_respiration": true,
      "respiratory_rate_range": "10-29",
      "radial_pulse": true,
      "follows_commands": true
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[]'::jsonb,
  '{
    "status": "in_transit",
    "team_id": "team-trn-002",
    "vehicle_id": "ambulance-002",
    "destination": {
      "hospital_id": "hospital-002",
      "hospital_name": "中央市民病院",
      "department": "内科"
    },
    "departure_time": "2025-10-18T09:50:00+09:00"
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-001",
    "created_at": "2025-10-18T09:22:00+09:00",
    "created_device_id": "device-001",
    "updated_by": "user-trn-002",
    "updated_at": "2025-10-18T09:50:00+09:00",
    "updated_device_id": "device-004",
    "version": 2,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 患者5: 緑タグ（軽症）
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-005',
  'event-001',
  'ANON-005',
  'T-2025-005',
  '{"age": 22, "sex": "male"}'::jsonb,
  '{
    "latitude": 35.6920,
    "longitude": 139.6960,
    "accuracy": 8,
    "method": "gps",
    "timestamp": "2025-10-18T09:50:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 18,
    "respiratory_status": "normal",
    "pulse_rate": 75,
    "radial_pulse_palpable": true,
    "consciousness": {"avpu": "alert"},
    "spo2": 99,
    "measured_at": "2025-10-18T09:50:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "green",
    "ai_confidence": 0.99,
    "ai_reasoning": "歩行可能、バイタル正常",
    "final": "green",
    "final_decided_by": "user-tri-002",
    "final_decided_at": "2025-10-18T09:51:00+09:00",
    "start_steps": {
      "can_walk": true,
      "has_respiration": true,
      "respiratory_rate_range": "10-29",
      "radial_pulse": true,
      "follows_commands": true
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[]'::jsonb,
  '{
    "status": "not_transported",
    "team_id": null,
    "vehicle_id": null
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-002",
    "created_at": "2025-10-18T09:51:00+09:00",
    "created_device_id": "device-003",
    "updated_by": "user-tri-002",
    "updated_at": "2025-10-18T09:51:00+09:00",
    "updated_device_id": "device-003",
    "version": 1,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 患者6: 緑タグ（軽症）
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-006',
  'event-001',
  'ANON-006',
  'T-2025-006',
  '{"age": 38, "sex": "female"}'::jsonb,
  '{
    "latitude": 35.6915,
    "longitude": 139.6925,
    "accuracy": 10,
    "method": "gps",
    "timestamp": "2025-10-18T09:55:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 16,
    "respiratory_status": "normal",
    "pulse_rate": 72,
    "radial_pulse_palpable": true,
    "consciousness": {"avpu": "alert"},
    "spo2": 98,
    "measured_at": "2025-10-18T09:55:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "green",
    "ai_confidence": 0.97,
    "ai_reasoning": "歩行可能、バイタル正常",
    "final": "green",
    "final_decided_by": "user-tri-002",
    "final_decided_at": "2025-10-18T09:56:00+09:00",
    "start_steps": {
      "can_walk": true,
      "has_respiration": true,
      "respiratory_rate_range": "10-29",
      "radial_pulse": true,
      "follows_commands": true
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[]'::jsonb,
  '{
    "status": "not_transported",
    "team_id": null,
    "vehicle_id": null
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-002",
    "created_at": "2025-10-18T09:56:00+09:00",
    "created_device_id": "device-003",
    "updated_by": "user-tri-002",
    "updated_at": "2025-10-18T09:56:00+09:00",
    "updated_device_id": "device-003",
    "version": 1,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 患者7: 黒タグ（死亡）
INSERT INTO triage_tags (
  id, event_id, anonymous_id, tag_number,
  patient_info, location, vital_signs, triage_category,
  retriage_history, attachments, treatments, transport, outcome,
  audit, created_at, updated_at
)
VALUES (
  'tag-007',
  'event-001',
  'ANON-007',
  'T-2025-007',
  '{"age": 67, "sex": "male"}'::jsonb,
  '{
    "latitude": 35.6875,
    "longitude": 139.6895,
    "accuracy": 15,
    "method": "gps",
    "timestamp": "2025-10-18T09:18:00+09:00"
  }'::jsonb,
  '{
    "respiratory_rate": 0,
    "respiratory_status": "stopped",
    "pulse_rate": 0,
    "radial_pulse_palpable": false,
    "consciousness": {"avpu": "unresponsive"},
    "spo2": 0,
    "measured_at": "2025-10-18T09:18:00+09:00"
  }'::jsonb,
  '{
    "ai_suggested": "black",
    "ai_confidence": 1.0,
    "ai_reasoning": "呼吸停止、脈拍なし",
    "final": "black",
    "final_decided_by": "user-tri-001",
    "final_decided_at": "2025-10-18T09:20:00+09:00",
    "start_steps": {
      "can_walk": false,
      "has_respiration": false,
      "respiratory_rate_range": "0",
      "radial_pulse": false,
      "follows_commands": false
    }
  }'::jsonb,
  '[]'::jsonb,
  '{"images": [], "audio_notes": []}'::jsonb,
  '[]'::jsonb,
  '{
    "status": "not_transported",
    "team_id": null,
    "vehicle_id": null
  }'::jsonb,
  NULL,
  '{
    "created_by": "user-tri-001",
    "created_at": "2025-10-18T09:20:00+09:00",
    "created_device_id": "device-001",
    "updated_by": "user-tri-001",
    "updated_at": "2025-10-18T09:20:00+09:00",
    "updated_device_id": "device-001",
    "version": 1,
    "revision_history": []
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ===== 4. チーム =====
INSERT INTO teams (id, event_id, type, name, members, current_location, status, assigned_area_ids, assigned_casualty_ids, vehicle, activity_log, created_at, updated_at)
VALUES
  (
    'team-trn-001',
    'event-001',
    'transport',
    '搬送第1隊',
    '[
      {"user_id": "user-trn-001", "role": "leader"},
      {"user_id": "user-trn-003", "role": "member"}
    ]'::jsonb,
    '{
      "latitude": 35.6850,
      "longitude": 139.6900,
      "accuracy": 10,
      "updated_at": "2025-10-18T09:45:00+09:00"
    }'::jsonb,
    'active',
    '[]'::text[],
    '["tag-002"]'::text[],
    '{
      "id": "ambulance-001",
      "type": "ambulance",
      "license_plate": "品川 500 あ 1234"
    }'::jsonb,
    '[
      {"action": "departed", "location": {"lat": 35.6895, "lng": 139.6917}, "timestamp": "2025-10-18T09:40:00+09:00"}
    ]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'team-trn-002',
    'event-001',
    'transport',
    '搬送第2隊',
    '[
      {"user_id": "user-trn-002", "role": "leader"},
      {"user_id": "user-trn-004", "role": "member"}
    ]'::jsonb,
    '{
      "latitude": 35.6890,
      "longitude": 139.6910,
      "accuracy": 10,
      "updated_at": "2025-10-18T09:52:00+09:00"
    }'::jsonb,
    'active',
    '[]'::text[],
    '["tag-004"]'::text[],
    '{
      "id": "ambulance-002",
      "type": "ambulance",
      "license_plate": "品川 500 あ 5678"
    }'::jsonb,
    '[
      {"action": "departed", "location": {"lat": 35.6895, "lng": 139.6917}, "timestamp": "2025-10-18T09:50:00+09:00"}
    ]'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ===== 完了メッセージ =====
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'デモデータ投入完了！';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'イベント: 1件';
  RAISE NOTICE '病院: 3件';
  RAISE NOTICE 'トリアージタグ: 7件';
  RAISE NOTICE '  - 赤（重症）: 2件';
  RAISE NOTICE '  - 黄（中等症）: 2件';
  RAISE NOTICE '  - 緑（軽症）: 2件';
  RAISE NOTICE '  - 黒（死亡）: 1件';
  RAISE NOTICE 'チーム: 2件';
  RAISE NOTICE '===========================================';
END $$;

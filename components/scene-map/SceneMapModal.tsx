'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { SceneMapData, SceneMapRow } from './types';

const SceneMapEditor = dynamic(() => import('./SceneMapEditor'), { ssr: false });
const SceneMapViewer = dynamic(() => import('./SceneMapViewer'), { ssr: false });
const SceneMapListView = dynamic(() => import('./SceneMapListView'), { ssr: false });

interface SceneMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
}

type ViewState = 'list' | 'editor' | 'viewer';

function generateDefaultName(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `現場図 ${mm}/${dd} ${hh}:${min}`;
}

export default function SceneMapModal({ isOpen, onClose, canEdit }: SceneMapModalProps) {
  const [view, setView] = useState<ViewState>('list');
  const [maps, setMaps] = useState<SceneMapRow[]>([]);
  const [selectedMap, setSelectedMap] = useState<SceneMapRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorKey, setEditorKey] = useState(0);
  const supabase = createClient();

  // ESC key to close / go back
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'list') {
          onClose();
        } else {
          setView('list');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, view]);

  // Fetch all maps
  const fetchMaps = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('scene_maps')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setMaps([]);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      setMaps((data as SceneMapRow[]) || []);
    } catch (err) {
      console.error('Failed to fetch scene maps:', err);
      setMaps([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      fetchMaps();
      setView('list');
      setSelectedMap(null);
    }
  }, [isOpen, fetchMaps]);

  // Select a map to view/edit
  const handleSelectMap = useCallback(
    (map: SceneMapRow) => {
      setSelectedMap(map);
      setEditorKey((k) => k + 1);
      setView(canEdit ? 'editor' : 'viewer');
    },
    [canEdit]
  );

  // Create new map
  const handleCreateNew = useCallback(() => {
    setSelectedMap(null);
    setEditorKey((k) => k + 1);
    setView('editor');
  }, []);

  // Go back to list
  const handleBackToList = useCallback(() => {
    setView('list');
    // Refresh list to show updated thumbnails
    fetchMaps();
  }, [fetchMaps]);

  // Save callback for editor (auto-save)
  const handleSave = useCallback(
    async (data: SceneMapData, mapName: string, thumbnail: string | null) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (selectedMap) {
        // Update existing
        const { error: updateError } = await supabase
          .from('scene_maps')
          .update({
            name: mapName,
            data: data as unknown as Record<string, unknown>,
            thumbnail,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedMap.id);

        if (updateError) throw updateError;

        // Update local state
        setSelectedMap((prev) =>
          prev
            ? { ...prev, name: mapName, data, thumbnail, updated_at: new Date().toISOString() }
            : prev
        );
        setMaps((prev) =>
          prev.map((m) =>
            m.id === selectedMap.id
              ? { ...m, name: mapName, data, thumbnail, updated_at: new Date().toISOString() }
              : m
          )
        );
      } else {
        // Insert new
        const { data: inserted, error: insertError } = await supabase
          .from('scene_maps')
          .insert({
            name: mapName,
            data: data as unknown as Record<string, unknown>,
            thumbnail,
            created_by: userId || 'unknown',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newMap = inserted as SceneMapRow;
        setSelectedMap(newMap);
        setMaps((prev) => [newMap, ...prev]);
      }
    },
    [supabase, selectedMap]
  );

  // Rename callback for list view
  const handleRename = useCallback(
    async (id: string, newName: string) => {
      try {
        const { error } = await supabase
          .from('scene_maps')
          .update({ name: newName, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        setMaps((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, name: newName, updated_at: new Date().toISOString() } : m
          )
        );
      } catch (err) {
        console.error('Failed to rename:', err);
      }
    },
    [supabase]
  );

  // Delete callback for list view
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('scene_maps').delete().eq('id', id);
        if (error) throw error;
        setMaps((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    },
    [supabase]
  );

  // Duplicate callback for list view
  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        const original = maps.find((m) => m.id === id);
        if (!original) return;

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        const { data: inserted, error: insertError } = await supabase
          .from('scene_maps')
          .insert({
            name: `${original.name}（コピー）`,
            data: original.data as unknown as Record<string, unknown>,
            thumbnail: original.thumbnail,
            created_by: userId || 'unknown',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newMap = inserted as SceneMapRow;
        setMaps((prev) => [newMap, ...prev]);
      } catch (err) {
        console.error('Failed to duplicate:', err);
      }
    },
    [supabase, maps]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (view === 'list') onClose();
        }}
      />

      {/* Modal body - fullscreen */}
      <div className="relative flex h-full w-full flex-col bg-white">
        {view === 'list' && (
          <SceneMapListView
            maps={maps}
            loading={loading}
            onSelect={handleSelectMap}
            onCreateNew={handleCreateNew}
            onClose={onClose}
            onRename={handleRename}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            canEdit={canEdit}
          />
        )}
        {view === 'editor' && (
          <SceneMapEditor
            key={editorKey}
            initialData={selectedMap?.data || null}
            mapName={selectedMap?.name || generateDefaultName()}
            onSave={handleSave}
            onBack={handleBackToList}
          />
        )}
        {view === 'viewer' && selectedMap && (
          <SceneMapViewer
            data={selectedMap.data}
            mapName={selectedMap.name}
            updatedAt={selectedMap.updated_at}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  );
}

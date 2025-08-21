import React, { useEffect, useState } from 'react';

export default function WorkspaceModal({
  isOpen,
  onClose,
  onSaveAs,
  onOverwrite,
  onLoad,
  onDelete,
  listWorkspaces,
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refresh();
      setSelected(null);
      setNewName('');
      setError('');
    }
  }, [isOpen]);

  const refresh = () => {
    try {
      const list = listWorkspaces();
      setWorkspaces(list);
    } catch (e) {
      console.error('Failed to load workspaces:', e);
      setWorkspaces([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg shadow-xl border border-gray-700 bg-neutral-900 text-white">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workspaces</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-sm opacity-80 mb-2">Saved workspaces</div>
            <div className="max-h-72 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
              {workspaces.length === 0 && (
                <div className="p-3 text-sm opacity-70">No workspaces yet.</div>
              )}
              {workspaces.map((ws) => {
                const isSelected = selected === ws.name;
                return (
                  <div
                    key={ws.name}
                    className={`group relative border border-gray-800 rounded overflow-hidden hover:border-gray-700 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelected(ws.name)}
                  >
                    <div className="aspect-video bg-black/30 flex items-center justify-center overflow-hidden">
                      {ws.thumbnailDataUrl ? (
                        <img src={ws.thumbnailDataUrl} alt={ws.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs opacity-60">No thumbnail</div>
                      )}
                    </div>
                    <div className="px-2 py-2">
                      <div className="text-sm truncate" title={ws.name}>{ws.name}</div>
                      <div className="text-[10px] opacity-60">
                        {ws.updatedAt ? new Date(ws.updatedAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <button
                      className="absolute top-1 right-1 text-[10px] px-2 py-1 rounded bg-red-600/80 hover:bg-red-600 opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ws.name);
                        refresh();
                        if (selected === ws.name) setSelected(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm opacity-80">Save current desktop as</div>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter name..."
                className="flex-1 px-3 py-2 rounded bg-neutral-800 border border-gray-700 focus:outline-none"
              />
              <button
                className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                disabled={!newName.trim() || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await onSaveAs(newName.trim());
                    setNewName('');
                    refresh();
                    setError('');
                  } catch (e) {
                    setError(e?.message || 'Failed to save workspace');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Save As
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              disabled={!selected || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (selected) await onLoad(selected);
                  setError('');
                  onClose();
                } catch (e) {
                  setError(e?.message || 'Failed to load workspace');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Load Selected
            </button>
            <button
              className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50"
              disabled={!selected || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (selected) await onOverwrite(selected);
                  setError('');
                  refresh();
                } catch (e) {
                  setError(e?.message || 'Failed to overwrite workspace');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Overwrite Selected
            </button>
            <div className="flex-1" />
            <button className="px-3 py-2 rounded bg-neutral-700 hover:bg-neutral-600" onClick={onClose}>
              Close
            </button>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </div>
  );
}

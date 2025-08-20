import React from 'react';

export interface HomeActivityItem {
  id: string;
  type: 'tool' | 'transcript' | 'status' | 'error';
  text: string;
}

interface HomeAssistantChatProps {
  open: boolean;
  recording: boolean;
  activity: HomeActivityItem[];
  onStart: () => void;
  onStop: () => void;
}

function HomeAssistantChat({ open, recording, activity, onStart, onStop }: HomeAssistantChatProps): JSX.Element | null {
  if (!open) return null;
  return (
    <div className="mb-2 w-[340px] max-h-[50vh] overflow-hidden shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 rounded-lg">
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" aria-hidden />
          <span className="font-medium">Home Assistant</span>
        </div>
        <div className="text-xs opacity-70">{recording ? 'Listening…' : 'Idle'}</div>
      </div>
      <div className="p-0">
        <div className="max-h-[36vh] overflow-y-auto p-3 space-y-2">
          {activity.length === 0 && (
            <p className="text-xs text-muted-foreground">Click Start to begin a live session and speak. Tools are routed for the home page context.</p>
          )}
          {activity.map(item => (
            <div key={item.id} className="text-xs leading-relaxed">
              <span className={
                item.type === 'error' ? 'text-red-600 dark:text-red-400' :
                item.type === 'tool' ? 'text-blue-600 dark:text-blue-400' :
                item.type === 'status' ? 'text-slate-500 dark:text-slate-400' : ''
              }>
                {item.text}
              </span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t dark:border-gray-800 flex items-center justify-end gap-2">
          {recording ? (
            <button onClick={onStop} className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">Stop</button>
          ) : (
            <button onClick={onStart} className="text-xs px-3 py-1.5 rounded-md bg-primary text-white hover:opacity-90">Start</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeAssistantChat;

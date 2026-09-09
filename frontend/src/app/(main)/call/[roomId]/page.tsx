'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function CallPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchToken = async () => {
      try {
        const response = await api.post('/calls/token', { room_id: roomId });
        setToken(response.data.token);
        setServerUrl(response.data.url);
      } catch (error) {
        toast.error('Failed to join call');
        router.push('/messages');
      }
    };

    fetchToken();
  }, [roomId, user, router]);

  if (!token || !serverUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0b0e14]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-gray-400">Connecting to room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0b0e14]">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={() => {
          toast.success('Left the call');
          router.push('/messages');
        }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

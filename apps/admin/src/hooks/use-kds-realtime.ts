'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

function socketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit && explicit.length > 0) return explicit;
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:4000';
  }
}

// Same singleton pattern as useStaffRealtime — socket.io's built-in
// reconnection handles dropped connections without re-creating the instance.
let sharedSocket: Socket | null = null;
function getSocket(): Socket {
  if (sharedSocket) return sharedSocket;
  sharedSocket = io(`${socketUrl()}/realtime`, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return sharedSocket;
}

interface KdsRealtimeOptions {
  /** Called when a new order lands. Used for the audio chime. */
  onNewOrder?: () => void;
}

/**
 * KDS-specific socket subscription: joins only the `kitchen` room (KITCHEN
 * role is enough — this lets a kitchen-only staff account use the board)
 * and invalidates the KDS feed on every relevant event.
 */
export function useKdsRealtime(options: KdsRealtimeOptions = {}) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  // Keep the latest callback in a ref so we don't need to re-subscribe just
  // because the parent re-rendered with a fresh `onNewOrder` closure.
  const onNewOrderRef = useRef(options.onNewOrder);
  useEffect(() => {
    onNewOrderRef.current = options.onNewOrder;
  });

  useEffect(() => {
    if (!token || !role) return;
    const socket = getSocket();
    const join = () => socket.emit('staff:join', { token, room: 'kitchen' });
    if (socket.connected) join();
    socket.on('connect', join);

    const onCreated = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'kds'] });
      onNewOrderRef.current?.();
    };
    const onStatusChanged = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'kds'] });
    };

    socket.on('order.created', onCreated);
    socket.on('order.statusChanged', onStatusChanged);

    return () => {
      socket.off('order.created', onCreated);
      socket.off('order.statusChanged', onStatusChanged);
      socket.off('connect', join);
    };
  }, [token, role, queryClient]);
}

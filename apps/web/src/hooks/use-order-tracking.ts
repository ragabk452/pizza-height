'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/api-types';

// Prefer the explicit WS URL when set, otherwise derive from the REST origin
// (strip the trailing /api/v1 — the socket namespace lives on the host root).
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

// Module-level singleton: react-query subscribers across pages share one
// connection. socket.io-client's built-in reconnection (enabled by default)
// handles dropped connections — we DON'T null the singleton on disconnect,
// because that would let a new `getSocket()` mint a second socket while the
// original one is still trying to reconnect in the background, ending up
// with duplicate handlers firing for every event.
let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (sharedSocket) return sharedSocket;
  sharedSocket = io(`${socketUrl()}/realtime`, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return sharedSocket;
}

/**
 * Subscribes to the `order:{id}` room and updates the cached Order in
 * react-query whenever an `order.statusChanged` event arrives.
 */
export function useOrderTracking(orderId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    const room = `order:${orderId}`;

    const join = () => socket.emit('join', room);
    if (socket.connected) join();
    socket.on('connect', join);

    // Re-fetch the order on mount/remount so a back-nav between two
    // tracking pages doesn't show stale data from before the room was left
    // (we missed any status updates while subscribed elsewhere).
    void queryClient.invalidateQueries({ queryKey: ['orders', orderId] });

    const handler = (payload: { id: string; status: OrderStatus; updatedAt: string }) => {
      if (payload.id !== orderId) return;
      queryClient.setQueryData<Order | undefined>(['orders', orderId], (prev) =>
        prev ? { ...prev, status: payload.status, updatedAt: payload.updatedAt } : prev,
      );
      // Refetch to pick up the new statusHistory row.
      void queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
    };

    socket.on('order.statusChanged', handler);

    return () => {
      socket.off('order.statusChanged', handler);
      socket.off('connect', join);
      if (socket.connected) socket.emit('leave', room);
    };
  }, [orderId, queryClient]);
}

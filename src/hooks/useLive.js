import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE } from '../config';
import { Session } from '../api';

/**
 * Opens a WebSocket (STOMP over SockJS), proves who you are with the JWT, and calls
 * onMessage(body) for every message on `topic`. Returns a ref to the STOMP client (for publishing).
 */
export function useLive(topic, onMessage, onStatus) {
  const callback = useRef(onMessage);
  const status = useRef(onStatus);
  const clientRef = useRef(null);
  useEffect(() => { callback.current = onMessage; status.current = onStatus; });

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(API_BASE + '/ws'),
      connectHeaders: { Authorization: 'Bearer ' + Session.token() },
      reconnectDelay: 4000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        if (status.current) status.current(true);
        client.subscribe(topic, (frame) => callback.current(frame.body));
      },
      onWebSocketClose: () => { if (status.current) status.current(false); }
    });
    clientRef.current = client;
    client.activate();
    return () => { client.deactivate(); };
  }, [topic]);

  return clientRef;
}

export function useBodyClass(name) {
  useEffect(() => {
    document.body.classList.add(name);
    return () => document.body.classList.remove(name);
  }, [name]);
}

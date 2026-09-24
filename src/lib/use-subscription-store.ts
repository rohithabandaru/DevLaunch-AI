'use client';

import { useSyncExternalStore } from 'react';
import type { UserSubscription, InvoiceRecord } from '@/types/subscription-types';
import { getActiveSubscription, getInvoices, DEFAULT_FREE_SUBSCRIPTION } from './subscription-storage';

const SUBSCRIPTION_EVENT = 'devlaunch_subscription_updated';

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SUBSCRIPTION_EVENT, onStoreChange);
  return () => window.removeEventListener(SUBSCRIPTION_EVENT, onStoreChange);
}

let cachedSub: UserSubscription | null = null;
let cachedSubKey = '';
let cachedInvoices: InvoiceRecord[] | null = null;
let cachedInvoicesKey = '';

export function useReactiveSubscription(): UserSubscription {
  return useSyncExternalStore(
    subscribe,
    () => {
      const next = getActiveSubscription();
      const key = JSON.stringify(next);
      if (key !== cachedSubKey) {
        cachedSub = next;
        cachedSubKey = key;
      }
      return cachedSub as UserSubscription;
    },
    () => DEFAULT_FREE_SUBSCRIPTION
  );
}

export function useReactiveInvoices(): InvoiceRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      const next = getInvoices();
      const key = JSON.stringify(next);
      if (key !== cachedInvoicesKey) {
        cachedInvoices = next;
        cachedInvoicesKey = key;
      }
      return cachedInvoices as InvoiceRecord[];
    },
    () => []
  );
}
import type { ReactNode } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { ErrorState, Special3Page } from '../../interaction';
import { productPresentationProvider } from '.';

export function ProductProviderGate({ title, children }:{ title:string; children:ReactNode }) {
  if (productPresentationProvider.available) return <>{children}</>;
  return <AppShell title={title} showBack><Special3Page><ErrorState title="Product integration required" detail={productPresentationProvider.reason ?? 'Verified Product data and actions are unavailable.'}/></Special3Page></AppShell>;
}

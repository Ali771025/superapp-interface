import { useEffect, useState } from 'react';
import { getStoredLanguage, type AppLanguage } from './language';

const fallback = {
  mission: 'Mission',
  assets: 'Assets',
  qora: 'QORA',
  earn: 'Earn',
  profile: 'Profile',
  journey: 'Journey',
  world: 'World',
  economy: 'Economy',
  passport: 'Passport',
  workspace: 'Workspace',
  explore: 'Explore ETERNITY',
  notifications: 'Notifications',
  settings: 'Settings',
  appearance: 'Appearance',
  history: 'History',
  newChat: 'New',
  connect: 'Connect wallet',
  disconnect: 'Disconnect wallet',
  language: 'Language & region',
  help: 'Help center',
};

export type UiCopy = typeof fallback;

const uiCopy: Record<AppLanguage, UiCopy> = {
  en: fallback,
  fa: { ...fallback, mission:'مأموریت', assets:'دارایی‌ها', qora:'کورا', earn:'درآمد', profile:'پروفایل', journey:'مسیر', world:'سرزمین اترنیتی', economy:'اقتصاد', passport:'پاسپورت', workspace:'فضای کاری', explore:'کاوش اترنیتی', notifications:'اعلان‌ها', settings:'تنظیمات', appearance:'ظاهر', history:'تاریخچه', newChat:'جدید', connect:'اتصال کیف پول', disconnect:'قطع کیف پول', language:'زبان و منطقه', help:'مرکز راهنما' },
  ar: { ...fallback, mission:'المهمة', assets:'الأصول', qora:'كورا', earn:'الأرباح', profile:'الملف', journey:'المسار', world:'العالم', economy:'الاقتصاد', passport:'الجواز' },
  tr: { ...fallback, mission:'Görev', assets:'Varlıklar', qora:'QORA', earn:'Kazanç', profile:'Profil', journey:'Yolculuk', world:'Dünya', economy:'Ekonomi', passport:'Pasaport' },
  fr: { ...fallback, mission:'Mission', assets:'Actifs', qora:'QORA', earn:'Gains', profile:'Profil', journey:'Parcours', world:'Monde', economy:'Économie', passport:'Passeport' },
  de: { ...fallback, mission:'Mission', assets:'Vermögen', qora:'QORA', earn:'Erträge', profile:'Profil', journey:'Reise', world:'Welt', economy:'Wirtschaft', passport:'Pass' },
  es: { ...fallback, mission:'Misión', assets:'Activos', qora:'QORA', earn:'Ganancias', profile:'Perfil', journey:'Ruta', world:'Mundo', economy:'Economía', passport:'Pasaporte' },
  zh: { ...fallback, mission:'任务', assets:'资产', qora:'QORA', earn:'收益', profile:'个人资料', journey:'旅程', world:'世界', economy:'经济', passport:'护照' },
  pt: { ...fallback, mission:'Missão', assets:'Ativos', qora:'QORA', earn:'Ganhos', profile:'Perfil', journey:'Jornada', world:'Mundo', economy:'Economia', passport:'Passaporte' },
  ru: { ...fallback, mission:'Миссия', assets:'Активы', qora:'QORA', earn:'Доход', profile:'Профиль', journey:'Путь', world:'Мир', economy:'Экономика', passport:'Паспорт' },
};

export function useAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() ?? 'en');
  useEffect(() => {
    const update = (event: Event) => setLanguage((event as CustomEvent<AppLanguage>).detail);
    window.addEventListener('eternity-language-change', update);
    return () => window.removeEventListener('eternity-language-change', update);
  }, []);
  return { language, copy: uiCopy[language] ?? fallback };
}

export function getUiCopy(language: AppLanguage) {
  return uiCopy[language] ?? fallback;
}

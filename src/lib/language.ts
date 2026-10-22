export type AppLanguage = 'en' | 'fa' | 'fr' | 'de' | 'es' | 'ar' | 'tr' | 'zh' | 'pt' | 'ru';

export const languages: Array<{ code: AppLanguage; name: string; english: string; status: 'supported' }> = [
  { code: 'en', name: 'English', english: 'English', status:'supported' },
];

export function availableLanguages(_previewMode: boolean) {
  return languages;
}

const KEY = 'eternity-language-v1';

export function detectLanguage(): AppLanguage {
  return 'en';
}

export function getStoredLanguage(): AppLanguage {
  return 'en';
}

export function applyLanguage(_language: AppLanguage) {
  window.localStorage.setItem(KEY, 'en');
  window.localStorage.removeItem('eternity-language');
  window.localStorage.removeItem('eternity-locale');
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  document.documentElement.dataset.language = 'en';
  window.dispatchEvent(new CustomEvent('eternity-language-change', { detail: 'en' }));
}

export function clearStoredLanguage() {
  window.localStorage.removeItem(KEY);
}

export const qoraCopy = {
  en: { greeting: 'Hi. Where would you like to begin?', returning: 'Welcome back. Ready to continue?', start: 'I want to start', learn: 'I want to learn', guide: 'Guide me', placeholder: 'Tell QORA what you need…' },
  fa: { greeting: 'سلام. دوست داری از کجا شروع کنیم؟', returning: 'خوش آمدی. آماده‌ای مسیرت را ادامه بدهیم؟', start: 'می‌خواهم شروع کنم', learn: 'می‌خواهم یاد بگیرم', guide: 'راهنمایی‌ام کن', placeholder: 'به کورا بگو چه چیزی نیاز داری…' },
  fr: { greeting: 'Bonjour. Par où souhaitez-vous commencer ?', returning: 'Bon retour. Prêt à continuer ?', start: 'Je veux commencer', learn: 'Je veux apprendre', guide: 'Guidez-moi', placeholder: 'Dites à QORA ce dont vous avez besoin…' },
  de: { greeting: 'Hallo. Wo möchtest du beginnen?', returning: 'Willkommen zurück. Bereit weiterzumachen?', start: 'Ich möchte starten', learn: 'Ich möchte lernen', guide: 'Führe mich', placeholder: 'Sag QORA, was du brauchst…' },
  es: { greeting: 'Hola. ¿Por dónde quieres empezar?', returning: 'Bienvenido de nuevo. ¿Continuamos?', start: 'Quiero empezar', learn: 'Quiero aprender', guide: 'Guíame', placeholder: 'Dile a QORA qué necesitas…' },
  ar: { greeting: 'مرحباً. من أين تريد أن نبدأ؟', returning: 'مرحباً بعودتك. هل نتابع؟', start: 'أريد أن أبدأ', learn: 'أريد أن أتعلم', guide: 'أرشدني', placeholder: 'أخبر كورا بما تحتاجه…' },
  tr: { greeting: 'Merhaba. Nereden başlamak istersin?', returning: 'Tekrar hoş geldin. Devam edelim mi?', start: 'Başlamak istiyorum', learn: 'Öğrenmek istiyorum', guide: 'Bana rehberlik et', placeholder: 'QORA’ya neye ihtiyacın olduğunu söyle…' },
  zh: { greeting: '你好。你想从哪里开始？', returning: '欢迎回来。准备继续吗？', start: '我想开始', learn: '我想学习', guide: '请指导我', placeholder: '告诉 QORA 你需要什么…' },
  pt: { greeting: 'Olá. Por onde quer começar?', returning: 'Bem-vindo de volta. Vamos continuar?', start: 'Quero começar', learn: 'Quero aprender', guide: 'Oriente-me', placeholder: 'Diga à QORA o que precisa…' },
  ru: { greeting: 'Здравствуйте. С чего хотите начать?', returning: 'С возвращением. Продолжим?', start: 'Хочу начать', learn: 'Хочу учиться', guide: 'Подскажи мне', placeholder: 'Расскажите QORA, что вам нужно…' },
} as const;

export function getQoraCopy(language: AppLanguage) {
  return qoraCopy[language as keyof typeof qoraCopy] ?? qoraCopy.en;
}

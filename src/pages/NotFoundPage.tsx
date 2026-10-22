import { useEffect } from 'react';
import { ArrowLeft, Compass, MessageCircleQuestion } from '@icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAppLanguage } from '../lib/useAppLanguage';

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppLanguage();
  const fa = language === 'fa';

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('eternity:broken-route', {
      detail: { path:location.pathname, referrer:document.referrer, at:new Date().toISOString() },
    }));
  }, [location.pathname]);

  return <AppShell title={fa ? 'مقصد در دسترس نیست' : 'Destination unavailable'}>
    <section className="not-found-state">
      <span><Compass size={34}/></span>
      <p className="workspace-eyebrow">404</p>
      <h1>{fa ? 'این مقصد در دسترس نیست.' : 'This destination is unavailable.'}</h1>
      <p>{fa ? 'ممکن است لینک قدیمی باشد یا قابلیت به مسیر دیگری منتقل شده باشد.' : 'The link may be outdated or the feature may have moved.'}</p>
      <div>
        <button onClick={() => navigate('/world')}><Compass size={17}/>{fa ? 'کاوش اترنیتی' : 'Explore ETERNITY'}</button>
        <button onClick={() => navigate('/qora?prompt=Help me find the destination I was looking for')}><MessageCircleQuestion size={17}/>{fa ? 'از کورا بپرس' : 'Ask QORA'}</button>
        <button onClick={() => navigate(-1)}><ArrowLeft size={17}/>{fa ? 'بازگشت' : 'Go back'}</button>
      </div>
    </section>
  </AppShell>;
}

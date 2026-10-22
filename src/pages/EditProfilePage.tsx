import { useState } from 'react';
import { Save, UserRound } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { useAppLanguage } from '../lib/useAppLanguage';
import { useEternityUserState } from '../lib/userState';

export function EditProfilePage() {
  const { language } = useAppLanguage();
  const fa = language === 'fa';
  const user = useEternityUserState();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('');

  return <AppShell title={fa ? 'ویرایش پروفایل' : 'Edit Profile'} showBack>
    <form className="edit-profile-form" onSubmit={(event) => {
      event.preventDefault();
      setStatus(fa ? 'پیش‌نویس محلی ذخیره شد. انتشار آنچین هنوز فعال نیست.' : 'Local draft saved. On-chain publishing is not enabled yet.');
    }}>
      <header><span><UserRound size={24}/></span><div><h1>{fa ? 'پروفایل عمومی' : 'Public profile'}</h1><p>{fa ? 'اطلاعات نمایشی را ویرایش کنید. آدرس کیف پول و EID از این فرم تغییر نمی‌کنند.' : 'Edit presentation details. Wallet address and EID cannot be changed here.'}</p></div></header>
      {!user.walletConnected && <p className="edit-profile-notice">{fa ? 'برای انتشار تغییرات، ابتدا کیف پول را متصل کنید.' : 'Connect a wallet before publishing changes.'}</p>}
      <label><strong>{fa ? 'نام نمایشی' : 'Display name'}</strong><input value={displayName} onChange={(event) => setDisplayName(event.target.value.slice(0, 40))} autoComplete="name"/><small>{fa ? 'حداکثر ۴۰ نویسه' : 'Up to 40 characters'}</small></label>
      <label><strong>{fa ? 'درباره من' : 'Bio'}</strong><textarea value={bio} onChange={(event) => setBio(event.target.value.slice(0, 240))} rows={5}/><small>{fa ? 'اطلاعات حساس یا کلید خصوصی وارد نکنید.' : 'Do not include sensitive data or private keys.'}</small></label>
      <button className="ds-button ds-button-primary" type="submit"><Save size={17}/>{fa ? 'ذخیره پیش‌نویس' : 'Save draft'}</button>
      {status && <p role="status">{status}</p>}
    </form>
  </AppShell>;
}

import { ArrowRight, Compass, MessageCircleQuestion, ShieldCheck, WalletCards } from '@icons';
import { useNavigate } from 'react-router-dom';
import type { ProductDefinition } from '../../data/productRegistry';
import { useAppLanguage } from '../../lib/useAppLanguage';
import { useWallet } from '../../lib/wallet-context';

export function GuestProductExperience({ product }: { product:ProductDefinition }) {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { language } = useAppLanguage();
  const fa = language === 'fa';
  return <section className="guest-product-experience">
    <span className="guest-product-experience__icon"><Compass size={28}/></span>
    <small>{fa ? 'حالت کاوش امن' : 'Safe exploration mode'}</small>
    <h2>{fa ? product.faLabel : product.label}</h2>
    <p>{fa ? product.faShortDescription : product.shortDescription}</p>
    <div className="guest-product-experience__facts">
      <span><ShieldCheck size={16}/><strong>{fa ? 'هیچ داده شخصی نمونه‌ای نمایش داده نمی‌شود.' : 'No sample personal data is shown.'}</strong></span>
      <span><WalletCards size={16}/><strong>{fa ? 'برای اقدام واقعی، اتصال کیف پول لازم است.' : 'A wallet is required only when you choose to act.'}</strong></span>
    </div>
    <div className="guest-product-experience__actions">
      <button type="button" onClick={wallet.connect} disabled={wallet.isConnecting}>{wallet.isConnecting ? (fa ? 'در حال اتصال…' : 'Connecting…') : (fa ? 'اتصال کیف پول' : 'Connect wallet')}<WalletCards size={17}/></button>
      <button type="button" onClick={() => navigate(`/qora?prompt=${encodeURIComponent(`Explain ${product.label}, its risks and whether it fits my goal before I connect a wallet.`)}`)}>{fa ? 'ابتدا از کورا بپرس' : 'Ask QORA first'}<MessageCircleQuestion size={17}/></button>
      <button type="button" onClick={() => navigate('/world')}>{fa ? 'ادامه کاوش اترنیتی' : 'Continue exploring ETERNITY'}<ArrowRight size={17}/></button>
    </div>
    {wallet.error && <p role="alert" className="guest-product-experience__error">{wallet.error}</p>}
  </section>;
}

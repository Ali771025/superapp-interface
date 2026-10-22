import { Link } from 'react-router-dom';
import { Orbit } from '@icons';
import { QoraAgentIcon } from '../components/ui/QoraAgentIcon';
import { Wallet } from '@icons';
import { useWallet } from '../lib/wallet-context';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const enter = async () => {
    if (wallet.isConnected) { navigate('/journey'); return; }
    const connected = await wallet.connect();
    if (connected) navigate('/journey');
  };
  return (
    <main className="territory-entry" id="main-content">
      <picture className="territory-entry-media" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet="/assets/entry/eternity-territory-mobile.webp" />
        <img
          src="/assets/entry/eternity-territory-desktop.webp"
          width="1672"
          height="941"
          alt=""
          fetchPriority="high"
        />
      </picture>
      <div className="territory-entry-scrim" aria-hidden="true" />

      <section className="territory-entry-content" aria-labelledby="territory-entry-title">
        <img
          className="territory-entry-logo"
          src="/assets/ui/eternity-logo-dark.png"
          width="1536"
          height="307"
          alt="ETERNITY"
        />
        <h1 id="territory-entry-title">Welcome to ETERNITY.</h1>
        <p className="territory-entry-value">A living Web3 ecosystem where your Profile records progress and QORA helps you understand and prepare every next step.</p>

        <div className="territory-entry-actions">
          <button type="button" onClick={enter} disabled={wallet.isConnecting} className="territory-entry-primary">
            {wallet.isConnected ? <Orbit size={21}/> : <Wallet size={21}/>} 
            <span>{wallet.isConnecting ? 'Connecting…' : wallet.isConnected ? 'Enter Journey' : 'Connect wallet'}</span>
          </button>
          <Link to="/qora" className="territory-entry-secondary">
            <QoraAgentIcon size={27} />
            <span>Ask QORA</span>
          </Link>
          <Link to="/journey" className="territory-entry-explore">Explore without wallet</Link>
        </div>
        {wallet.error && <p className="territory-entry-error" role="alert">{wallet.error}</p>}
      </section>

      <p className="territory-entry-footnote">Identity · Participation · Ownership · Intelligence</p>
    </main>
  );
}

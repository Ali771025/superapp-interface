import { Bot, Compass, Menu, Route, UserRound } from '@icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppMode } from '../../lib/app-mode-context';
import { cn } from '../../lib/utils';
import { EternityLogo } from '../ui/EternityLogo';
import { QoraAgentIcon } from '../ui/QoraAgentIcon';
import { ThemeToggle } from '../ui/ThemeToggle';
import { WalletButton } from '../ui/WalletButton';
import { useAppLanguage, type UiCopy } from '../../lib/useAppLanguage';

const items=[
  {label:'qora' as keyof UiCopy,path:'/qora',icon:Bot},
  {label:'journey' as keyof UiCopy,path:'/home',icon:Route},
  {label:'profile' as keyof UiCopy,path:'/profile',icon:UserRound},
];

export function QoraModeHeader({ onMenu }: { onMenu?: () => void }) {
  const {setMode}=useAppMode();const navigate=useNavigate();const {copy}=useAppLanguage();
  return <header className="s3-qora-mode-header">{onMenu&&<button onClick={onMenu} className="s3-qora-header-menu lg:hidden" aria-label="Open navigation"><Menu size={19}/></button>}<EternityLogo className="h-7 sm:h-8"/><div className="s3-qora-mode-status"><QoraAgentIcon size={20}/><span>QORA</span><i/></div><div className="s3-qora-header-actions"><ThemeToggle/><button onClick={()=>{setMode('workspace');navigate('/home');}} className="s3-qora-open-workspace"><Compass size={16}/><span>{copy.workspace}</span></button><WalletButton/></div></header>;
}

export function QoraModeNavigation({ className }: { className?: string }) {
  const { setMode } = useAppMode(); const { copy } = useAppLanguage();
  return <nav className={cn('s3-qora-mode-nav',className)} aria-label="QORA Mode navigation">{items.map(({label,path,icon:Icon})=><NavLink key={path} to={path} onClick={()=>setMode('qora')} className={({isActive})=>cn(isActive&&'is-active')}><span>{label==='qora'?<QoraAgentIcon size={24}/>:<Icon size={19}/>}</span><small>{copy[label]}</small></NavLink>)}</nav>;
}

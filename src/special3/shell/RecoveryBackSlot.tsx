import { ChevronLeft } from '@icons';
import { useNavigate } from 'react-router-dom';

export function RecoveryBackSlot() {
  const navigate = useNavigate();
  const back = () => (window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/home', { replace:true });
  return <div className="recovery-back-slot" data-shell-back-slot>
    <button className="recovery-back-slot__button" type="button" onClick={back} aria-label="Go back"><ChevronLeft aria-hidden="true"/><span>Back</span></button>
  </div>;
}

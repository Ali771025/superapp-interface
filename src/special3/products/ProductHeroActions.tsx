import { useNavigate } from 'react-router-dom';
import { ContextualQoraLead } from '../hero';

export function ProductHeroActions({ product }: { product:string }){
  const navigate=useNavigate();
  return <ContextualQoraLead
    prompt={`Explain ${product}, its current route context and the safest next step. Do not execute or authorize any Product action.`}
    journey={{label:`Open ${product} Journey context`,progressLabel:'Journey',onOpen:()=>navigate(`/journey?product=${encodeURIComponent(product)}`)}}
  />;
}

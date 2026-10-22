import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Send, Square } from '@icons';
import type { VoiceState } from '../../qora/types';
import type { AppLanguage } from '../../lib/language';
import { getQoraCopy } from '../../lib/language';
import { cn } from '../../lib/utils';
import { BorderBeam } from 'border-beam';

export function VoiceComposer({ onSend, disabled, language = 'en', onVoiceStateChange, microphoneFirst = false }: { onSend: (message: string) => void; disabled?: boolean; language?: AppLanguage; onVoiceStateChange?: (state: VoiceState) => void; microphoneFirst?: boolean }) {
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const copy = getQoraCopy(language);
  useEffect(() => onVoiceStateChange?.(voiceState), [onVoiceStateChange, voiceState]);
  const submit = () => { const value = input.trim(); if (!value || disabled) return; onSend(value); setInput(''); };
  const toggleListening = async () => {
    if (voiceState === 'listening') {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setVoiceState('offline');
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setVoiceState('listening');
    } catch { setVoiceState('denied'); }
  };
  const composer = <div className="s3-qora-text-composer">
      <label htmlFor="qora-prompt" className="sr-only">Message QORA</label>
      <textarea id="qora-prompt" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={1} placeholder={copy.placeholder}/>
      <button type="button" onClick={toggleListening} className={cn('s3-qora-microphone-control', voiceState === 'listening' && 'is-listening')} aria-label={voiceState === 'listening' ? 'Stop listening' : 'Speak to QORA'}>{voiceState === 'processing' ? <Loader2 size={20} className="animate-spin"/> : voiceState === 'listening' ? <Square size={18}/> : voiceState === 'denied' ? <MicOff size={20}/> : <Mic size={20}/>}</button>
      <button type="button" onClick={submit} disabled={!input.trim() || disabled} className="s3-qora-send-control" aria-label="Send message"><Send size={19}/></button>
    </div>;
  return <div className={cn('s3-qora-composer s3-qora-composer', voiceState !== 'idle' && 'has-voice-state', microphoneFirst && 'is-microphone-first')}>
    <BorderBeam size="line" colorVariant="colorful" duration={3.1} borderRadius={17} active={voiceState === 'listening'} strength={voiceState === 'listening' ? 1 : 0} className="s3-qora-voice-beam">{composer}</BorderBeam>
    {voiceState !== 'idle' && <div className={`s3-qora-voice-state is-${voiceState}`} role="status"><span className="s3-qora-voice-light" aria-hidden="true"/>{voiceState === 'listening' ? 'Listening… tap stop when finished' : voiceState === 'offline' ? 'Voice transcription is unavailable in this build · use text' : voiceState === 'processing' ? 'Understanding…' : 'Microphone unavailable · use text'}</div>}
  </div>;
}

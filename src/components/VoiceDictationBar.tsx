import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, Volume2, Globe } from 'lucide-react';
import { 
  createSpeechRecognitionInstance, 
  isSpeechRecognitionSupported, 
  parseVoiceTranscriptToTask, 
  ParsedVoiceTask 
} from '../services/voiceParserService';

interface VoiceDictationBarProps {
  onVoiceParsed: (parsed: ParsedVoiceTask) => void;
  workplace?: string;
}

export const VoiceDictationBar: React.FC<VoiceDictationBarProps> = ({ 
  onVoiceParsed, 
  workplace = 'المديرية الإقليمية للعدل بسطات' 
}) => {
  const isSupported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'ar-MA' | 'ar-SA' | 'fr-FR'>('ar-MA');
  const [transcript, setTranscript] = useState('');
  const [lastParsedSummary, setLastParsedSummary] = useState<ParsedVoiceTask['detectedSummary'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setErrorMessage('متصفحك الحالي لا يدعم ميزة التعرف الصوتي المباشر. استخدم متصفح Chrome أو Edge.');
      return;
    }

    setErrorMessage(null);
    setTranscript('');
    setLastParsedSummary(null);

    try {
      const recognition = createSpeechRecognitionInstance();
      if (!recognition) return;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('تم رفض الإذن باستخدام الميكروفون. يرجى تفعيل إذن الميكروفون في إعدادات المتصفح.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('لم يتم التقاط أي صوت. يرجى المحاولة والتحدث بوضوح.');
        } else {
          setErrorMessage(`تنبيه أثناء التعرف الصوتي: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage(`تعذر تشغيل الميكروفون: ${err.message}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    // If we have transcript, parse it
    if (transcript.trim()) {
      handleProcessTranscript(transcript);
    }
  };

  const handleProcessTranscript = (text: string) => {
    if (!text.trim()) return;
    const parsed = parseVoiceTranscriptToTask(text, workplace);
    setLastParsedSummary(parsed.detectedSummary);
    onVoiceParsed(parsed);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/60 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-3 space-y-2 text-xs transition-all">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all
              ${isListening 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}
            `}
            title={isListening ? 'إيقاف التسجيل الصوتي والتحليل' : 'بدء الإملاء الصوتي المباشر'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 animate-bounce" />
                <span>إيقاف وتحليل ⏹️</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>إملاء صوتي ذكي 🎙️</span>
              </>
            )}
          </button>

          {isListening && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>جار الاستماع الصوتي... تكلم بحرية</span>
            </div>
          )}
        </div>

        {/* Language selector & hint */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              disabled={isListening}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ar-MA" className="dark:bg-slate-800">العربية (المغرب) 🇲🇦</option>
              <option value="ar-SA" className="dark:bg-slate-800">العربية الفصحى 🇸🇦</option>
              <option value="fr-FR" className="dark:bg-slate-800">Français (Admin) 🇫🇷</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live transcript preview */}
      {transcript && (
        <div className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 flex items-start justify-between gap-2 shadow-inner">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">النص الصوتي الملتقط:</span>
            <p className="text-xs font-semibold leading-relaxed">&quot;{transcript}&quot;</p>
          </div>
          {!isListening && (
            <button
              type="button"
              onClick={() => handleProcessTranscript(transcript)}
              className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 shrink-0"
            >
              إعادة التحليل ⚡
            </button>
          )}
        </div>
      )}

      {/* Extraction feedback summary badges */}
      {lastParsedSummary && (
        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
          <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>تم استخراج المعطيات تلقائياً:</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold">
            📅 {lastParsedSummary.dateDetected}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold">
            🏷️ {lastParsedSummary.domainDetected}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold">
            📍 {lastParsedSummary.facilityDetected}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold">
            ⚡ {lastParsedSummary.priorityDetected}
          </span>
          {lastParsedSummary.subtasksDetectedCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
              ☑️ {lastParsedSummary.subtasksDetectedCount} عمليات فرعية مستخرجة
            </span>
          )}
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-1.5 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

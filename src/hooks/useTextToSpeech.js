import { useState, useEffect, useRef, useCallback } from 'react';

// Simple status enum for TTS lifecycle
const TTS_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
};

/**
 * Text-to-Speech hook using the Web Speech API.
 * Tracks word-level and sentence-level positions via onboundary events.
 */
const useTextToSpeech = ({ sentences, enabled = true, voice = null }) => {
  const [status, setStatus] = useState(TTS_STATUS.IDLE);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  const utteranceRef = useRef(null);
  const wordRangesRef = useRef([]); // [{ sentenceIndex, sentenceStart, words: [{ start, end }] }]

  // Prepare utterance and word offsets when sentences / voice change
  useEffect(() => {
    if (!enabled || !Array.isArray(sentences) || sentences.length === 0) {
      setStatus(TTS_STATUS.IDLE);
      setActiveSentenceIndex(-1);
      setActiveWordIndex(-1);
      setIsSupported(false);
      setError(null);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
      wordRangesRef.current = [];
      return;
    }

    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    const synthesis = window.speechSynthesis;
    const UtteranceCtor = window.SpeechSynthesisUtterance;

    if (!synthesis || !UtteranceCtor) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setError(null);
    setStatus(TTS_STATUS.IDLE);
    setActiveSentenceIndex(-1);
    setActiveWordIndex(-1);

    // Cancel any ongoing speech for fresh playback
    synthesis.cancel();

    const joined = sentences.join(' ');

    // Precompute sentence offsets and word ranges within the joined string
    const wordRanges = [];
    let cursor = 0;

    sentences.forEach((sentence, sentenceIndex) => {
      const sentenceStart = cursor;

      const words = [];
      const wordRegex = /\S+/g;
      let match;

      while ((match = wordRegex.exec(sentence)) !== null) {
        const localStart = match.index;
        const wordText = match[0];
        const globalStart = sentenceStart + localStart;
        const globalEnd = globalStart + wordText.length;
        words.push({ start: globalStart, end: globalEnd });
      }

      wordRanges.push({ sentenceIndex, sentenceStart, words });

      const separator = sentenceIndex < sentences.length - 1 ? 1 : 0; // space between sentences
      cursor += sentence.length + separator;
    });

    wordRangesRef.current = wordRanges;

    const utterance = new UtteranceCtor(joined);

    if (voice) {
      utterance.voice = voice;
      if (voice.lang) {
        utterance.lang = voice.lang;
      }
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Boundary callback to detect current sentence and word index
    utterance.onboundary = (event) => {
      if (event.name !== 'word') return;
      if (typeof event.charIndex !== 'number') return;

      const charIndex = event.charIndex;
      const allSentenceWordRanges = wordRangesRef.current;

      if (!allSentenceWordRanges.length) return;

      let foundSentenceIndex = -1;
      let foundWordIndex = -1;

      for (let i = 0; i < allSentenceWordRanges.length; i += 1) {
        const { words } = allSentenceWordRanges[i];
        if (!words || !words.length) continue;

        if (charIndex < words[0].start) continue;

        for (let w = 0; w < words.length; w += 1) {
          const range = words[w];
          if (charIndex >= range.start && charIndex <= range.end) {
            foundSentenceIndex = i;
            foundWordIndex = w;
            break;
          }
        }

        if (foundSentenceIndex !== -1) {
          break;
        }
      }

      if (foundSentenceIndex !== -1 && foundWordIndex !== -1) {
        setActiveSentenceIndex(foundSentenceIndex);
        setActiveWordIndex(foundWordIndex);
      }
    };

    // Handle end of speech
    utterance.onend = () => {
      setStatus(TTS_STATUS.FINISHED);
      setActiveSentenceIndex(-1);
      setActiveWordIndex(-1);
    };

    // Basic error handling
    utterance.onerror = (event) => {
      setError(event?.error || 'Unable to play text-to-speech.');
      setStatus(TTS_STATUS.IDLE);
      setActiveSentenceIndex(-1);
      setActiveWordIndex(-1);
    };

    utteranceRef.current = utterance;

    // Cleanup on unmount or sentences / voice change
    return () => {
      synthesis.cancel();
      utteranceRef.current = null;
      wordRangesRef.current = [];
      setStatus(TTS_STATUS.IDLE);
      setActiveSentenceIndex(-1);
      setActiveWordIndex(-1);
    };
  }, [sentences, enabled, voice]);

  const play = useCallback(() => {
    if (!isSupported || !utteranceRef.current) return;

    try {
      window.speechSynthesis.cancel(); // prevent overlapping speech
      setActiveSentenceIndex(-1);
      setActiveWordIndex(-1);
      window.speechSynthesis.speak(utteranceRef.current);
      setStatus(TTS_STATUS.PLAYING);
    } catch (e) {
      setError(e?.message || 'Failed to start text-to-speech.');
      setStatus(TTS_STATUS.IDLE);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
      setStatus(TTS_STATUS.PAUSED);
    } catch (e) {
      setError(e?.message || 'Failed to pause text-to-speech.');
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
      setStatus(TTS_STATUS.PLAYING);
    } catch (e) {
      setError(e?.message || 'Failed to resume text-to-speech.');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setStatus(TTS_STATUS.IDLE);
      setActiveSentenceIndex(-1);
      setActiveWordIndex(-1);
    } catch (e) {
      setError(e?.message || 'Failed to stop text-to-speech.');
    }
  }, [isSupported]);

  return {
    status,
    activeSentenceIndex,
    activeWordIndex,
    isSupported,
    error,
    play,
    pause,
    resume,
    stop,
  };
};

export default useTextToSpeech;


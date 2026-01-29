import React, { useMemo, useEffect, useState } from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTrendingUp, 
  FiPackage, 
  FiTarget,
  FiAward,
  FiThumbsUp,
  FiThumbsDown,
  FiPlay,
  FiPause,
  FiStopCircle
} from 'react-icons/fi';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import './TranscriptDetails.scss';

// Reusable Card Component
const Card = ({ title, icon: Icon, children, className = '', headerActions }) => (
  <div className={`card ${className}`}>
    <div className="card-header">
      <div className="card-header-main">
        {/* {Icon && <Icon className="card-icon" />} */}
        <h3 className="card-title">{title}</h3>
      </div>
      {headerActions && (
        <div className="card-header-actions">
          {headerActions}
        </div>
      )}
    </div>
    <div className="card-content">
      {children}
    </div>
  </div>
);

// Reusable List Item Component
const ListItem = ({ text, type = 'neutral', icon: CustomIcon }) => {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="list-icon" />;
    
    switch (type) {
      case 'positive':
        return <FiCheckCircle className="list-icon positive" />;
      case 'negative':
        return <FiAlertCircle className="list-icon negative" />;
      default:
        return <FiTarget className="list-icon neutral" />;
    }
  };

  return (
    <div className={`list-item list-item-${type}`}>
      {getIcon()}
      <span className="list-text">{text}</span>
    </div>
  );
};

// Sentiment Section Component
const SentimentSection = ({ sentiments }) => (
  <div className="sentiment-grid">
    {sentiments.positive && sentiments.positive.length > 0 && (
      <div className="sentiment-column">
        <div className="sentiment-header positive">
          <FiThumbsUp className="sentiment-icon" />
          <h4>Positive Feedback</h4>
        </div>
        <div className="sentiment-items">
          {sentiments.positive.map((item, index) => (
            <ListItem key={index} text={item} type="positive" />
          ))}
        </div>
      </div>
    )}
    
    {sentiments.negative && sentiments.negative.length > 0 && (
      <div className="sentiment-column">
        <div className="sentiment-header negative">
          <FiThumbsDown className="sentiment-icon" />
          <h4>Concerns & Pain Points</h4>
        </div>
        <div className="sentiment-items">
          {sentiments.negative.map((item, index) => (
            <ListItem key={index} text={item} type="negative" />
          ))}
        </div>
      </div>
    )}
  </div>
);

// Recommendation Badge Component
const Badge = ({ text, className = '' }) => (
  <span className={`badge ${className}`}>{text}</span>
);

// Helper function to get first word from text
const getFirstWord = (text) => {
  return text.split(' ')[0];
};

// Helper to split conversation into sentences
const splitIntoSentences = (text) => {
  if (!text) return [];
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const matches = normalized.match(/[^.!?]+[.!?"]*/g);
  if (!matches) {
    return [normalized];
  }

  return matches.map((sentence) => sentence.trim()).filter(Boolean);
};

const TranscriptDetails = ({ transcriptData }) => {
  if (!transcriptData) {
    return (
      <div className="transcript-details">
        <p className="no-data">No transcript data available</p>
      </div>
    );
  }

  const {
    conversation_overview,
    customer_sentiment,
    next_steps,
    portfolio_recommendations,
    product_interests,
    risk_appetite,
    rm_evaluation
  } = transcriptData;

  const conversationSentences = useMemo(
    () => splitIntoSentences(conversation_overview),
    [conversation_overview]
  );

  // Tokenize sentences into words and spaces for stable word-level rendering
  const tokenizedConversation = useMemo(() => {
    return conversationSentences.map((sentence, sentenceIndex) => {
      const tokens = [];
      const parts = sentence.match(/\S+|\s+/g) || [];
      let wordIndex = 0;

      parts.forEach((part, idx) => {
        if (/^\s+$/.test(part)) {
          tokens.push({
            type: 'space',
            value: part,
            key: `s-${sentenceIndex}-sp-${idx}`,
          });
        } else {
          tokens.push({
            type: 'word',
            value: part,
            wordIndex,
            key: `s-${sentenceIndex}-w-${wordIndex}`,
          });
          wordIndex += 1;
        }
      });

      return {
        sentenceIndex,
        tokens,
        wordCount: wordIndex,
      };
    });
  }, [conversationSentences]);

  // Voice handling (accent + gender selection)
  const [voiceOptions, setVoiceOptions] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');

  const selectedVoice = useMemo(
    () => voiceOptions.find((opt) => opt.id === selectedVoiceId)?.voice || null,
    [voiceOptions, selectedVoiceId]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const synthesis = window.speechSynthesis;

    const inferGender = (voice) => {
      const name = (voice.name || '').toLowerCase();
      if (
        name.includes('tessa') ||
        name.includes('moira') ||
        name.includes('female') ||
        name.includes('girl') ||
        name.includes('emma') ||
        name.includes('amy') ||
        name.includes('sara') ||
        name.includes('olivia')
      ) {
        return 'Female';
      }
      if (
        name.includes('daniel') ||
        name.includes('male') ||
        name.includes('man') ||
        name.includes('boy') ||
        name.includes('brian') ||
        name.includes('arthur') ||
        name.includes('george') ||
        name.includes('harry')
      ) {
        return 'Male';
      }
      return 'Neutral';
    };

    const buildVoiceOptions = () => {
      const allVoices = synthesis.getVoices() || [];
      if (!allVoices.length) return;

      const englishVoices = allVoices.filter((voice) => {
        const lang = (voice.lang || '').toLowerCase();
        return lang.startsWith('en');
      });

      if (!englishVoices.length) {
        setVoiceOptions([]);
        return;
      }

      const maleVoices = englishVoices.filter((voice) => inferGender(voice) === 'Male');
      const femaleVoices = englishVoices.filter((voice) => inferGender(voice) === 'Female');

      const options = [];

      if (maleVoices.length > 0) {
        const danielVoice = maleVoices.find((voice) => 
          (voice.name || '').toLowerCase().includes('daniel')
        );
        const defaultMale = danielVoice || maleVoices[0];
        const id = defaultMale.voiceURI || `${defaultMale.name}-${defaultMale.lang}`;
        options.push({
          id,
          label: `Atlas Voice - Male`,
          voice: defaultMale,
        });
      }

      if (femaleVoices.length > 0) {
        const tessaVoice = femaleVoices.find((voice) => 
          (voice.name || '').toLowerCase().includes('tessa')
        );
        const defaultFemale = tessaVoice || femaleVoices[0];
        const id = defaultFemale.voiceURI || `${defaultFemale.name}-${defaultFemale.lang}`;
        options.push({
          id,
          label: `Atlas Voice - Female`,
          voice: defaultFemale,
        });
      }

      setVoiceOptions(options);

      if (!selectedVoiceId && options.length) {
        setSelectedVoiceId(options[0].id);
      }
    };

    buildVoiceOptions();

    synthesis.addEventListener('voiceschanged', buildVoiceOptions);

    return () => {
      synthesis.removeEventListener('voiceschanged', buildVoiceOptions);
    };
  }, [selectedVoiceId]);

  const {
    status: ttsStatus,
    activeSentenceIndex: ttsActiveSentenceIndex,
    activeWordIndex: ttsActiveWordIndex,
    isSupported: isTTSSupported,
    error: ttsError,
    play: ttsPlay,
    pause: ttsPause,
    resume: ttsResume,
    stop: ttsStop
  } = useTextToSpeech({
    sentences: conversationSentences,
    enabled: Boolean(conversation_overview),
    voice: selectedVoice,
  });

  // Primary Play / Pause / Resume handler
  const handleTtsPrimaryAction = () => {
    if (!isTTSSupported || !conversationSentences.length) return;

    if (ttsStatus === 'playing') {
      ttsPause();
    } else if (ttsStatus === 'paused') {
      ttsResume();
    } else {
      ttsPlay();
    }
  };

  // Explicit Stop handler
  const handleTtsStop = () => {
    if (!isTTSSupported) return;
    ttsStop();
  };

  const handleVoiceChange = (event) => {
    const nextVoiceId = event.target.value;
    const shouldRestart =
      ttsStatus === 'playing' && isTTSSupported && conversationSentences.length > 0;

    setSelectedVoiceId(nextVoiceId);

    if (isTTSSupported) {
      ttsStop();
      if (shouldRestart) {
        setTimeout(() => {
          ttsPlay();
        }, 0);
      }
    }
  };

  return (
    <div className="transcript-details">
      {/* <div className="transcript-header">
        <h2>Conversation Analysis</h2>
      </div> */}

      <div className="transcript-grid">
        {/* Conversation Overview */}
        {conversation_overview && (
          <Card
            title="Conversation Overview"
            icon={FiPackage}
            className="overview-card"
            headerActions={
              <div className="tts-controls">
                {isTTSSupported && voiceOptions.length > 0 && (
                  <select
                    className="tts-voice-select"
                    value={selectedVoiceId}
                    onChange={handleVoiceChange}
                    aria-label="Select reading voice"
                  >
                    {voiceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="tts-button"
                  onClick={handleTtsPrimaryAction}
                  disabled={!isTTSSupported || !conversationSentences.length}
                  aria-label={
                    !isTTSSupported
                      ? 'Text to speech is not available'
                      : ttsStatus === 'playing'
                        ? 'Pause reading conversation'
                        : ttsStatus === 'paused'
                          ? 'Resume reading conversation'
                          : 'Play conversation as audio'
                  }
                  aria-pressed={ttsStatus === 'playing'}
                >
                  {!isTTSSupported
                    ? <FiPlay />
                    : ttsStatus === 'playing'
                      ? <FiPause />
                      : <FiPlay />}
                </button>
                <button
                  type="button"
                  className="tts-button tts-button-stop"
                  onClick={handleTtsStop}
                  disabled={!isTTSSupported || ttsStatus === 'idle'}
                  aria-label="Stop reading conversation"
                >
                  <FiStopCircle />
                </button>
              </div>
            }
          >
            <p className="overview-text tts-text" aria-live="off">
              {tokenizedConversation.map(({ sentenceIndex, tokens }) => (
                <span key={sentenceIndex} className="tts-sentence">
                  {tokens.map((token) => {
                    if (token.type === 'space') {
                      return token.value;
                    }

                    const isFinished = ttsStatus === 'finished';
                    let wordClassName = 'tts-word';

                    if (!isTTSSupported || !conversationSentences.length) {
                      wordClassName = 'tts-word';
                    } else if (isFinished) {
                      wordClassName = 'tts-word tts-read';
                    } else if (ttsStatus === 'playing' || ttsStatus === 'paused') {
                      if (ttsActiveSentenceIndex === -1 && ttsActiveWordIndex === -1) {
                        wordClassName = 'tts-word tts-light';
                      } else if (sentenceIndex < ttsActiveSentenceIndex) {
                        wordClassName = 'tts-word tts-read';
                      } else if (sentenceIndex > ttsActiveSentenceIndex) {
                        wordClassName = 'tts-word tts-light';
                      } else if (token.wordIndex < ttsActiveWordIndex) {
                        wordClassName = 'tts-word tts-read';
                      } else if (token.wordIndex === ttsActiveWordIndex) {
                        wordClassName = 'tts-word tts-active';
                      } else {
                        wordClassName = 'tts-word tts-light';
                      }
                    } else {
                      wordClassName = 'tts-word tts-light';
                    }

                    const isActiveWord =
                      sentenceIndex === ttsActiveSentenceIndex &&
                      token.wordIndex === ttsActiveWordIndex;

                    return (
                      <span
                        key={token.key}
                        className={wordClassName}
                        aria-live={isActiveWord ? 'polite' : undefined}
                        aria-atomic={isActiveWord ? 'true' : undefined}
                      >
                        {token.value}
                      </span>
                    );
                  })}
                </span>
              ))}
            </p>
            {!isTTSSupported && (
              <p className="tts-support-message">
                Text-to-speech is not available in this browser.
              </p>
            )}
            {/* {ttsError && (
              <p className="tts-error-message">
                {ttsError}
              </p>
            )} */}
          </Card>
        )}

        {/* Customer Sentiment */}
        {customer_sentiment && (
          <Card title="Customer Sentiment & Pain Points" className="sentiment-card full-width">
            <SentimentSection sentiments={customer_sentiment} />
          </Card>
        )}

        {/* Risk Appetite */}
        {risk_appetite && (
          <Card title="Risk Appetite Analysis" icon={FiTrendingUp} className="risk-card">
            <p className="risk-text">{risk_appetite}</p>
          </Card>
        )}

        {/* Product Interests and Portfolio Recommendations Row */}
        {((product_interests && product_interests.length > 0) || (portfolio_recommendations && portfolio_recommendations.length > 0)) && (
          <div className="transcript-grid two-column-layout" style={{ gridColumn: '1 / -1' }}>
            {/* Product Interests */}
            {product_interests && product_interests.length > 0 && (
              <Card title="Product Interests & Demand Signals" icon={FiTarget} className="product-interests-card">
                <div className="badges-container">
                  {product_interests.map((interest, index) => (
                    <Badge key={index} text={interest} className="interest-badge" />
                  ))}
                </div>
              </Card>
            )}

            {/* Portfolio Recommendations */}
            {portfolio_recommendations && portfolio_recommendations.length > 0 && (
              <Card title="Portfolio Recommendations" icon={FiAward} className="portfolio-recommendations-card">
                <div className="recommendations-list">
                  {portfolio_recommendations.map((rec, index) => (
                    <ListItem key={index} text={rec} type="neutral" />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Next Steps */}
        {next_steps && next_steps.length > 0 && (
          <Card title="Next Best Actions (AI-Suggested)" icon={FiCheckCircle} className="full-width">
            <div className="next-steps-grid">
              {next_steps.map((step, index) => (
                <div key={index} className="step-item">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{step}</span>
                  <button className="step-button" onClick={() => console.log(`Action clicked: ${step}`)}>
                    {getFirstWord(step)}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* RM Evaluation */}
        {rm_evaluation && (
          <Card title="RM Effectiveness Evaluation" className="rm-evaluation-card full-width">
            <div className="evaluation-grid">
              {rm_evaluation.positive && rm_evaluation.positive.length > 0 && (
                <div className="evaluation-section">
                  <h4 className="evaluation-title positive">
                    <FiCheckCircle /> Strengths
                  </h4>
                  {rm_evaluation.positive.map((item, index) => (
                    <ListItem key={index} text={item} type="positive" />
                  ))}
                </div>
              )}

              {/* {rm_evaluation.negative && rm_evaluation.negative.length > 0 && (
                <div className="evaluation-section">
                  <h4 className="evaluation-title negative">
                    <FiAlertCircle /> Areas for Improvement
                  </h4>
                  {rm_evaluation.negative.map((item, index) => (
                    <ListItem key={index} text={item} type="negative" />
                  ))}
                </div>
              )} */}
              {
                <div className="evaluation-section">
                  <h4 className="evaluation-title negative">
                    <FiAlertCircle /> Areas for Improvement
                  </h4>
                  {[
    "Could have asked more probing questions about investment timeline",
    "Missed opportunity to discuss tax implications of proposed investments", 
    "Should have explored client's previous investment experience in more detail",
    "Failed to address client's concerns about market volatility adequately",
    "Could have provided more specific examples of portfolio diversification"
  ].map((item, index) => (
                    <ListItem key={index} text={item} type="negative" />
                  ))}
                </div>
              }
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TranscriptDetails;
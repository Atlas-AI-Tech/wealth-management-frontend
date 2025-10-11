import React from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTrendingUp, 
  FiPackage, 
  FiTarget,
  FiAward,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import './TranscriptDetails.scss';

// Reusable Card Component
const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`card ${className}`}>
    <div className="card-header">
      {/* {Icon && <Icon className="card-icon" />} */}
      <h3 className="card-title">{title}</h3>
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


  return (
    <div className="transcript-details">
      {/* <div className="transcript-header">
        <h2>Conversation Analysis</h2>
      </div> */}

      <div className="transcript-grid">
        {/* Conversation Overview */}
        {conversation_overview && (
          <Card title="Conversation Overview" icon={FiPackage} className="overview-card " >
            <p className="risk-text">{conversation_overview}</p>
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
import { useEffect, useRef, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import Typewriter from "typewriter-effect";
import {
  fetchChatHistoryFromServer,
  sendUserQueryToAiModelOnServer,
} from "../../services/chatService";
import { convertToIST, scrollToBottom } from "../../utils/chatBotMethods";
import "./ChatWindow.scss";
import ReplyAnimation from "./ReplyAnimation";

const AiChatBubble = ({
  isAnimating = false,
  setIsAnimating,
  text,
  ReplyAnimationComponent,
  isWaitingForAiResponse = false,
  intent,
  created_at,
}) => {
  return (
    <div className="chat-bubble-ai">
      {intent !== "warning" ? (
        <FiMessageSquare style={{ height: "24px", width: "24px" }} />
      ) : (
        <MdErrorOutline
          style={{ height: "26px", width: "26px", color: "red" }}
        />
      )}
      <div className="ai-chat-box">
        <div className="ai-chat-text">
          {isWaitingForAiResponse ? (
            ReplyAnimationComponent && <ReplyAnimationComponent />
          ) : isAnimating ? (
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .changeDelay(15)
                  .typeString(text)
                  .callFunction(() => {
                    setIsAnimating(false);
                  })
                  .start();
              }}
            />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3182ce", textDecoration: "underline" }}
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    style={{
                      paddingLeft: "1.5rem",
                      listStyleType: "decimal",
                    }}
                  >
                    {children}
                  </ol>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          )}
        </div>

        {created_at && (
          <div className="chat-time-indicator">{convertToIST(created_at)}</div>
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({
  isClosing,
  currentUserView,
  clientFeatureDetails,
}) => {
  const [isChatWindowOpening, setIsChatWindowOpening] = useState(false);
  const [isWaitingForAiResponse, setIsWaitingForAiResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const { id } = useParams();

  // Internal ref for chat container
  const chatContainerScrollRef = useRef(null);
  const inputRef = useRef(null);


  useEffect(() => {
    let intervalId;
    intervalId = setInterval(() => {
      scrollToBottom(chatContainerScrollRef);
    }, 500);

    if (!isAnimating) {
      clearInterval(intervalId);
      inputRef?.current?.focus();
      scrollToBottom(chatContainerScrollRef);
    }
    return () => clearInterval(intervalId);
  }, [isAnimating]);

  // scroll to bottom whenever the user types or opens chatbox for the firstTime
  useEffect(() => {
    scrollToBottom(chatContainerScrollRef);
  }, [currentChat, chatHistory]);

  useEffect(() => {
    // Start chat opening animation after component mounts
    setIsChatWindowOpening(true);

    const handleGetChatHistoryFromServer = async () => {
      try {
        let response = await fetchChatHistoryFromServer();
        setChatHistory(response.messages);
        scrollToBottom(chatContainerScrollRef);
        inputRef?.current?.focus();
      } catch (error) {
        console.log(error.response?.data?.error || error.message);
      }
    };

    handleGetChatHistoryFromServer();

    // Cleanup chat opening animation state on unmount
    return () => setIsChatWindowOpening(false);
  }, [id]);

  // reset the current chat array when view changes
  useEffect(() => {
    setCurrentChat([]);
  }, [currentUserView]);

  const handleSendUserQueryToAiModel = async (
    event,
    sendButtonClick = null,
    inputRef
  ) => {
    if (event?.key === "Enter" || sendButtonClick === "sendIconClicked") {
      const inputText = inputRef.current.value;
      if (!inputText.trim()) return;
      inputRef.current.value = "";
      setIsWaitingForAiResponse(true);

      // Add user message to current chat
      setCurrentChat((prev) => {
        const updatedChat = [
          ...prev,
          {
            created_at: new Date()
              .toISOString()
              .slice(0, 19)
              .replace("Z", ""),
            message_content: inputText,
            role: "user",
          },
        ];
        return updatedChat;
      });

      try {
        // Send the user query to the server
        const response = await sendUserQueryToAiModelOnServer(inputText);
        
        // Add AI response to current chat
        setCurrentChat((prev) => {
          const updatedChat = [
            ...prev,
            {
              created_at: new Date()
                .toISOString()
                .slice(0, 19)
                .replace("Z", ""),
              message_content: response.ai_response,
              role: "ai",
            },
          ];
          return updatedChat;
        });

        // Set animations or loading indicators
        setIsAnimating(true);
        setIsWaitingForAiResponse(false);
      } catch (error) {
        console.log(error.message);
        setIsWaitingForAiResponse(false); // Handle errors gracefully
        setIsAnimating(false);
      }
    }
  };

  console.log("currentUserView", currentUserView);

  return (
    <div
      className={`chat-window ${
        isChatWindowOpening && !isClosing ? "visible" : "hidden"
      } customer-chat-window-size`}
    >
      <h2 className="title" style={{ textAlign: "center" }}>
        Chat with Atlas
      </h2>
      {/* <p className="sub-title">
        Connect with your loan assistant for personalised support and expert
        guidance
      </p> */}


      <div
        className={
          "chat-content "
          // +(isChatFeatureDisabled && "blur-content")
        }
      >
        {/* <div className="timestamp">
          <span></span> <p>Today</p> <span></span>
        </div> */}

        {chatHistory.map(
          ({ message_content, message_sender, created_at, intent }, index) => {
            return message_sender === "user" ? (
              <div key={created_at + index} className="user-chat-box">
                <div className="user-chat-text">{message_content}</div>
                <div className="chat-time-indicator user-time-indicator">
                  {convertToIST(created_at)}
                </div>
              </div>
            ) : (
              <AiChatBubble
                key={created_at + index}
                text={message_content}
                intent={intent}
                created_at={created_at}
              />
            );
          }
        )}

        {currentChat.map(
          ({ message_content, role, created_at, intent }, index) => {
            return role === "user" ? (
              <div key={created_at + index} className="user-chat-box">
                <div className="user-chat-text">{message_content}</div>
                <div className="chat-time-indicator user-time-indicator">
                  {convertToIST(created_at)}
                </div>
              </div>
            ) : (
              <>
                {index === currentChat.length - 1 ? (
                  <AiChatBubble
                    key={created_at + index}
                    isAnimating={isAnimating}
                    setIsAnimating={setIsAnimating}
                    performTypingAnimation={true}
                    text={message_content}
                    intent={intent}
                    created_at={created_at}
                  />
                ) : (
                  <AiChatBubble
                    key={created_at + index}
                    text={message_content}
                    intent={intent}
                    created_at={created_at}
                  />
                )}
              </>
            );
          }
        )}

        {isWaitingForAiResponse && (
          <AiChatBubble
            ReplyAnimationComponent={ReplyAnimation}
            isWaitingForAiResponse={isWaitingForAiResponse}
          />
        )}

        {/* Empty div for automatically scrolling to bottom */}
        <div ref={chatContainerScrollRef} />
      </div>

      {/*  {isChatFeatureDisabled && (
        <div className="locked-content-view">
          <div className="lock-icon">
            <IoIosLock />
          </div>

          <div className="locked-content-text">
            Contact Admin to Unlock this Feature
          </div>
        </div>
      )} */}

      <div className="chat-input-box">
        <div className="input-group">
          <input
            ref={inputRef}
            id="user-query-to-ai"
            type="text"
            placeholder="Type your query here..."
            className="chat-input"
            onKeyDown={(e) => handleSendUserQueryToAiModel(e, "", inputRef)}
            disabled={isWaitingForAiResponse || isAnimating}
          />
          <span
            onClick={(e) =>
              handleSendUserQueryToAiModel(e, "sendIconClicked", inputRef)
            }
            className={
              "input-icon " +
              ((isWaitingForAiResponse || isAnimating) && "disabled")
            }
          >
            <IoSend />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

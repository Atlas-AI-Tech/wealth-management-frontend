import { useState } from "react";
import "./ChatBot.scss";
import ChatBotCircle from "./ChatBotCircle";
import ChatWindow from "./ChatWindow";

const ChatBot = ({
  currentUserView = "company-insights",
  clientFeatureDetails = {},
}) => {
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [isChatWindowClosing, setIsChatWindowClosing] = useState(false);

  const handleClose = () => {
    setIsChatWindowClosing(true);
    setTimeout(() => {
      setIsChatWindowOpen(false);
      setIsChatWindowClosing(false);
    }, 500); // Make sure this is same as transition time in ChatWindow.scss
  };

  return (
    <div className="chatbot">
      <ChatBotCircle
        handleClose={handleClose}
        setIsChatWindowOpen={setIsChatWindowOpen}
        isChatWindowOpen={isChatWindowOpen}
      />
      {isChatWindowOpen && (
        <ChatWindow
          currentUserView={currentUserView}
          isClosing={isChatWindowClosing}
          clientFeatureDetails={clientFeatureDetails}
        />
      )}
    </div>
  );
};

export default ChatBot;

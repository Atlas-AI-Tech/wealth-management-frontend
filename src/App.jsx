
import './App.scss'
import ChatBot from './components/chatbot/ChatBot'
import Navbar from './components/Navbar'
import Dashboard from './pages/dashboard/Dashboard'

function App() {

  return (
    <div>
      <Navbar />
      <Dashboard />
      <ChatBot />
    </div>
  )
}

export default App

import { Route, Routes } from "react-router-dom"
import Header from "./home/Header"
import ChatScreen from "./home/ChatScreen"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/chat" element={<ChatScreen />} />
      </Routes>
    </>
  )
}

export default App

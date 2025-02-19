import TSXFromStringRender from "@/components/TSXFromStringRender"
import { ChatWindow } from "../components/HomeChatPage/ChatWindow"

function Home() {
  // component for the main page

  // home page arranged generally as side-by-side components, the chat and the recipe.
  return (
    <div className="home-page w-screen h-screen flex justify-between items-center absolute top-0 left-0 p-8 ">
      {/* ACTUAL CHAT SECTION */}
      <div className="chat-window-container w-[35vw] h-[85vh]">
        <ChatWindow />
      </div>

      {/* RENDERED RECIPE SECTION  */}
      <div className="recipe-section h-screen overflow-y-auto ml-48 p-10 ">
        <TSXFromStringRender cn="rendered-recipe-content" />
      </div>
    </div>
  )
}

export default Home

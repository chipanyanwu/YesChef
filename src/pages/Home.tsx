import RenderRecipe from "@/components/Recipe/RenderRecipe"
import TSXFromStringRender from "@/components/TSXFromStringRender"

import { useRecipe } from "@/context/RecipeContext"

import { ChatWindow } from "../components/Home/ChatWindow"

function Home() {
  // component for the main page

  const { isInit, showRendering } = useRecipe()

  // home page arranged generally as side-by-side components, the chat and the recipe.
  return (
    <div
      className="home-page w-screen h-screen grid gap-4 p-4 absolute top-0 left-0 "
      style={{
        // 6 cols x 5 rows
        gridTemplateColumns: "repeat(6, 1fr)",
        gridTemplateRows: "repeat(6, 1fr)",
      }}
    >
      {/* LOGO SECTION */}
      <div className="logo col-span-2 row-span-1 bg-white pl-3 rounded-md border flex items-center">
        <div className="header-logo-hexagon bg-app_teal_light w-[20%]  flex items-center justify-center">
          <img
            src="/vectors/yes-chef-robot.svg"
            className="object-scale-down scale-[0.9]"
          />
        </div>
        <h1 className="logo-text ml-4 text-6xl font-black text-white ">
          Yes Chef!
        </h1>
      </div>

      {/* ACTUAL CHAT SECTION */}

      <div
        className="col-span-2 row-span-5 "
        style={{
          gridColumn: isInit ? "2 / 6" : "1 / 3",
          gridRow: isInit ? "3 / 5" : "2 / 7",
        }}
      >
        <div
          className="chat-window-container transition-all duration-1000 ease-in-out w-full h-full"
          // style={{
          //   width : isInit ? '60vw' : '30vw',
          //   height : isInit ? '55vh' : '80vh',
          //   // transform : !isInit ? "translateX(-30vw)" : "translateX(0)",
          //   // left : isInit ? '20vw' : '3vw',
          //   // marginTop : isInit ? '0' : '12vh',

          //   // letting deepseek take the reigns here....
          //   left: isInit ? '50%' : '0',
          //   top: isInit ? '50%' : '12vh',
          //   transform: isInit
          //     ? 'translate(-50%, -50%)' // Center initially
          //     : 'translate(0, 0)' // Align left after transition

          // }}
        >
          <ChatWindow />
        </div>
      </div>

      {/* RENDERED RECIPE SECTION  */}
      {showRendering && (
        <div className="recipe-section surrounding-shadow col-start-3 col-end-7 row-span-full max-h-full overflow-y-auto border bg-white p-4 pl-10 pt-8 rounded-md animate-fadeIn">
          <RenderRecipe />
        </div>
      )}
    </div>
  )
}

export default Home

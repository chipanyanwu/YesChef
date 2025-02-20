// import {transform} from '@babel/standalone';
import { useRecipe } from "@/context/RecipeContext"
import parse from "html-react-parser"
// import { diffChars } from "diff"
import { useEffect, useState } from "react"

type Props = {
  cn: string
}

// const highlightChanges = (oldRecipe : string, newRecipe : string) => {
//   const differences = diffChars(oldRecipe, newRecipe);
//   let result = "";

//   differences.forEach((part) => {
//     if (part.added) {
//       // wrap added parts in highlight span
//       result += `<span className='recently-edited-recipe-html'>${part.value}</span>`;
//     } else if (!part.removed) {
//       result += part.value;
//     }
//   });

//   return result;
// }

export default function TSXFromStringRender({ cn }: Props) {
  const { prevRecipe, rawRecipe } = useRecipe()
  const [changedHtml, setChangedHtml] = useState(rawRecipe)

  useEffect(() => {
    // if (prevRecipe && rawRecipe !== prevRecipe) {
    //   const newHtml = highlightChanges(prevRecipe, rawRecipe);
    //   setChangedHtml(newHtml);

    //   const timeout = setTimeout(() => {
    //     setChangedHtml(rawRecipe);
    //   }, 2000);

    //   return () => clearTimeout(timeout);
    // }
    setChangedHtml(rawRecipe)
  }, [rawRecipe, prevRecipe])

  // adding a custom classname so we can call it '.rendered-recipe-window' or something and style its parts in globalas
  return (
    <div
      className={`rendered-text p-5 m-4 mt-10 pl-12 rounded-lg bg-gray-50 ${cn}`}
      style={{
        boxShadow: `0 0 8px 3px rgba(0, 0, 0, 0.08)`,
      }}
    >
      {parse(changedHtml)}
    </div>
  )
}

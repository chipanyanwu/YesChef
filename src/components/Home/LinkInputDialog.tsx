import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,  } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { scrapeWebsite } from "@/lib/recipe_parsing/web_scrape"
import { useState } from 'react'
import { useRecipe } from '@/context/RecipeContext'
import { renderNewRecipeFromString } from '@/lib/gemini/Gemini'
import { ChatMessage } from '@/types/chat-entry'


export default function LinkInputDialog() {

  const [linkInput, setLinkInput] = useState("");
  const {updateRecipe, pushChat, setGenerationState } = useRecipe();

  async function handleLinkEntry() {

    setGenerationState(true);
    const resp = await scrapeWebsite(linkInput);
    console.log(`LINK SCRAPE DATA : \n${resp}`);
    setLinkInput("");

    const {editedHTML, summary} = await renderNewRecipeFromString(resp);

    updateRecipe(editedHTML);
    pushChat({message : summary, role : "BOT"} as ChatMessage);


    setGenerationState(false);

  }

  return (
    <Dialog>
        <DialogTrigger>
        <Button variant="outline" className="rounded-full object-scale-down overflow-hidden w-[40px] h-[40px] mr-5">
            <img src='/vectors/link.svg' className="scale-[3]" />
        </Button>
        </DialogTrigger>

        <DialogContent>
        <DialogHeader>
            <DialogTitle>
            Paste the link to the recipe you want to load...
            </DialogTitle>
        </DialogHeader>

        <div className="link-input flex gap-4">
            <Input className="w-[85%]" placeholder="Link to recipe..." onChange={(e) => setLinkInput(e.target.value)} value={linkInput}/>
            <Button variant="outline" className='w-[10%]' onClick={handleLinkEntry}>
                <div className='bg-gray-900 w-[15px] h-[15px] rounded-full' />
            </Button>
        </div>

        </DialogContent>
    </Dialog>
  )
}
import { ChatMessage } from "@/types/chats"

interface Props {
  message: ChatMessage
}

export const ChatBubble = ({ message }: Props) => {
  const isUser = message.role === "USER"
  const bubbleStyles = `flex rounded-xl w-fit max-w-[75%] h-auto p-2 border border-gray-100 ${
    isUser ? "ml-auto" : "ml-0"
  }`
  const backgroundColor = isUser
    ? "var(--yes-chef-teal-light)"
    : "rgb(17 24 39)"
  const textColor = isUser ? "rgb(17 24 39)" : "#f1f1f1"

  return (
    <div className={bubbleStyles} style={{ backgroundColor }}>
      <p className="text-wrap text-left" style={{ color: textColor }}>
        {message.message}
      </p>
    </div>
  )
}

import { ChatMessage } from "@/types/chats"

type Props = {
  message?: ChatMessage
  loading?: boolean
}

export const ChatBubble = ({ message, loading }: Props) => {
  if (loading) {
    return (
      <div
        className="flex rounded-xl w-fit max-w-[75%] h-auto p-2 border border-gray-100 ml-0"
        style={{ backgroundColor: "rgb(17 24 39)" }}
      >
        <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div
      className={`flex rounded-xl w-fit max-w-[75%] h-auto p-2 border border-gray-100 ${
        message!.role === "USER" ? "ml-auto" : "ml-0"
      }`}
      style={{
        backgroundColor:
          message!.role === "USER"
            ? "var(--yes-chef-teal-light)"
            : "rgb(17 24 39)",
      }}
    >
      <p
        className="text-wrap text-left"
        style={{
          color: message!.role === "USER" ? "rgb(17 24 39)" : "#f1f1f1",
        }}
      >
        {message!.message}
      </p>
    </div>
  )
}

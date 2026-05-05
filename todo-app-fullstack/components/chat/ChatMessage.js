export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
        ${isUser ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'}`}>
        {isUser ? 'U' : '✦'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}>
          {message.content}
        </div>

        {/* Tool calls badge */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.toolCalls.map((tc, i) => {
              const toolName = tc.split('(')[0]
              return (
                <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200 font-mono">
                  ⚡ {toolName}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

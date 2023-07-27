import {IconArrowDown, IconBolt, IconBrandGoogle, IconPlayerStop, IconRepeat, IconSend} from "@tabler/icons-react"
import {KeyboardEvent, MutableRefObject, useCallback, useContext, useEffect, useRef, useState} from "react"

import {useTranslation} from "next-i18next"

import {isEnterKey} from "@/utils/app/keys"

import {Message} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"
import {Plugin} from "@/types/plugin"
import {Prompt} from "@/types/prompt"

import HomeContext from "@/pages/api/home/home.context"

import {ChatInputTokenCount} from "./ChatInputTokenCount"
import {PluginSelect} from "./PluginSelect"
import {PromptList} from "./PromptList"
import {PromptVariableModal} from "./PromptVariableModal"


interface Props {
  model: OpenAIModel
  onSend: (message: Message, plugin: Plugin | null) => void
  onRegenerate: () => void
  onScrollDownClick: () => void
  stopConversationRef: MutableRefObject<boolean>
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  showScrollDownButton: boolean
}

export const ChatInput = ({
  model,
  onSend,
  onRegenerate,
  onScrollDownClick,
  stopConversationRef,
  textareaRef,
  showScrollDownButton
}: Props) => {
  const {t} = useTranslation("chat")

  const {
    state: {selectedConversation, messageIsStreaming, prompts}
  } = useContext(HomeContext)

  const [content, setContent] = useState<string>()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [showPromptList, setShowPromptList] = useState(false)
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [promptInputValue, setPromptInputValue] = useState("")
  const [variables, setPromptVariables] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showPluginSelect, setShowPluginSelect] = useState(false)
  const [plugin, setPlugin] = useState<Plugin | null>(null)

  const promptListRef = useRef<HTMLUListElement | null>(null)

  const filteredPrompts = prompts.filter((prompt) => prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()))

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const maxLength = selectedConversation?.model.maxLength

    if (maxLength && value.length > maxLength) {
      alert(
        t(`Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`, {
          maxLength,
          valueLength: value.length
        })
      )
      return
    }

    setContent(value)
    updatePromptListVisibility(value)
  }

  const handleSend = () => {
    function removeEmptyLines(content: string) {
      // Remove trailing whitespace and consecutive newlines.
      return content.replace(/\s+$/, "").replace(/\n{3,}/g, "\n")
    }

    if (messageIsStreaming) {
      return
    }
    if (!content) {
      return
    }

    onSend({role: "user", content: removeEmptyLines(content)}, plugin)
    setContent("")
    setPlugin(null)

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur()
    }
  }

  const handleStopConversation = () => {
    stopConversationRef.current = true
    setTimeout(() => {
      stopConversationRef.current = false
    }, 3000)
  }

  const handleInitModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex]
    if (selectedPrompt) {
      setContent((prevContent) => {
        return prevContent?.replace(/\/\w*$/, selectedPrompt.content)
      })
      handlePromptSelect(selectedPrompt)
    }
    setShowPromptList(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActivePromptIndex((prevIndex) => (prevIndex < filteredPrompts.length - 1 ? prevIndex + 1 : prevIndex))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActivePromptIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex))
      } else if (e.key === "Tab") {
        e.preventDefault()
        setActivePromptIndex((prevIndex) => (prevIndex < filteredPrompts.length - 1 ? prevIndex + 1 : 0))
      } else if (isEnterKey(e)) {
        e.preventDefault()
        handleInitModal()
      } else if (e.key === "Escape") {
        e.preventDefault()
        setShowPromptList(false)
      } else {
        setActivePromptIndex(0)
      }
    } else if (isEnterKey(e) && !isTyping && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else if (e.key === "/" && e.metaKey) {
      e.preventDefault()
      setShowPluginSelect(!showPluginSelect)
    }
  }

  const parsePromptVariables = (content: string) => {
    const regex = /{{(.*?)}}/g
    const foundPromptVariables = []
    let match

    while ((match = regex.exec(content)) !== null) {
      foundPromptVariables.push(match[1])
    }

    return foundPromptVariables
  }

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/^\/(.*)$/)

    if (match) {
      setShowPromptList(true)
      setPromptInputValue(match[0].slice(1))
    } else {
      setShowPromptList(false)
      setPromptInputValue("")
    }
  }, [])

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedPromptVariables = parsePromptVariables(prompt.content)
    setPromptVariables(parsedPromptVariables)

    if (parsedPromptVariables.length > 0) {
      setIsModalVisible(true)
    } else {
      setContent((prevContent) => {
        return prevContent?.replace(/\/\w*$/, prompt.content)
      })
      updatePromptListVisibility(prompt.content)
    }
  }

  const handleSubmit = (updatedPromptVariables: string[]) => {
    const newContent = content?.replace(/{{(.*?)}}/g, (match, promptVariable) => {
      const index = variables.indexOf(promptVariable)
      return updatedPromptVariables[index]
    })

    setContent(newContent)
    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setContent("")
    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 36
    }
  }, [activePromptIndex])

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`
      textareaRef.current.style.overflow = `${textareaRef?.current?.scrollHeight > 400 ? "auto" : "hidden"}`
    }
  }, [content])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (promptListRef.current && !promptListRef.current.contains(e.target as Node)) {
        setShowPromptList(false)
      }
    }

    window.addEventListener("click", handleOutsideClick)

    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [])

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#343541] dark:to-[#343541] md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl">
        {messageIsStreaming && (
          <button
            className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
            onClick={handleStopConversation}
          >
            <IconPlayerStop size={16} /> {t("Stop generating")}
          </button>
        )}

        {!messageIsStreaming && selectedConversation && selectedConversation.messages.length > 0 && (
          <button
            className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
            onClick={onRegenerate}
          >
            <IconRepeat size={16} /> {t("Regenerate response")}
          </button>
        )}

        <div className="relative mx-2 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] sm:mx-4">
          <button
            className="absolute left-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={() => setShowPluginSelect(!showPluginSelect)}
          >
            {plugin ? <IconBrandGoogle size={20} /> : <IconBolt size={20} />}
          </button>

          {showPluginSelect && (
            <div className="absolute left-0 bottom-14 rounded bg-white dark:bg-[#343541]">
              <PluginSelect
                plugin={plugin}
                onKeyDown={(e: any) => {
                  if (e.key === "Escape") {
                    e.preventDefault()
                    setShowPluginSelect(false)
                    textareaRef.current?.focus()
                  }
                }}
                onPluginChange={(plugin: Plugin) => {
                  setPlugin(plugin)
                  setShowPluginSelect(false)

                  if (textareaRef && textareaRef.current) {
                    textareaRef.current.focus()
                  }
                }}
              />
            </div>
          )}

          <div className="absolute bottom-full md:mb-4 mb-12 mx-auto flex w-full justify-center md:justify-end pointer-events-none">
            <ChatInputTokenCount content={content} tokenLimit={model.tokenLimit} />
          </div>

          <textarea
            ref={textareaRef}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 py-2 pr-8 pl-10 text-black dark:bg-transparent dark:text-white md:py-3 md:pl-10"
            style={{
              resize: "none",
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: "400px",
              overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 400 ? "auto" : "hidden"}`
            }}
            placeholder={
              prompts.length > 0 ? t('Type a message or type "/" to select a prompt...') : t("Type a message...")
            }
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            className="absolute right-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={handleSend}
          >
            {messageIsStreaming ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconSend size={18} />
            )}
          </button>

          {showScrollDownButton && (
            <div className="absolute bottom-12 right-0 lg:bottom-0 lg:-right-10">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
                onClick={onScrollDownClick}
              >
                <IconArrowDown size={18} />
              </button>
            </div>
          )}

          {showPromptList && filteredPrompts.length > 0 && (
            <div className="absolute bottom-12 w-full">
              <PromptList
                activePromptIndex={activePromptIndex}
                prompts={filteredPrompts}
                onSelect={handleInitModal}
                onMouseOver={setActivePromptIndex}
                promptListRef={promptListRef}
              />
            </div>
          )}

          {isModalVisible && (
            <PromptVariableModal
              prompt={filteredPrompts[activePromptIndex]}
              promptVariables={variables}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onClose={() => setIsModalVisible(false)}
            />
          )}
        </div>
      </div>
      <div className="px-3 pt-2 pb-3 text-center text-[12px] text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
        <a href="https://github.com/rijnb/chatty-server" target="_blank" className="underline">
          Chatty
        </a>
        &nbsp;was developed by Rijn Buve, originally based on the works of Mckay Wrigley and others on&nbsp;
        <a href="https://github.com/mckaywrigley/chatbot-ui" target="_blank" className="underline">
          chatbot-ui
        </a>
      </div>
    </div>
  )
}
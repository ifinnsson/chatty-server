import {FC, KeyboardEvent, useEffect, useRef, useState} from "react"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Prompt} from "@/types/prompt"

interface Props {
  prompt: Prompt
  promptVariables: string[]
  onSubmit: (updatedPromptVariables: string[]) => void
  onClose: () => void
  onCancel: () => void
}

export const PromptInputVars: FC<Props> = ({prompt, promptVariables, onSubmit, onClose, onCancel}) => {
  const [updatedPromptVariables, setUpdatedPromptVariables] = useState<{ key: string; value: string }[]>(
      promptVariables
          .map((promptVariable) => ({key: promptVariable, value: ""}))
          .filter((item, index, array) => array.findIndex((t) => t.key === item.key) === index)
  )

  const modalRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (index: number, value: string) => {
    setUpdatedPromptVariables((prev) => {
      const updated = [...prev]
      updated[index].value = value
      return updated
    })
  }

  const handleSubmit = () => {
    onSubmit(updatedPromptVariables.map((variable) =>
        variable.value === "" ? " " : variable.value))
    onClose()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e) && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onCancel()
      }
    }
    window.addEventListener("click", handleOutsideClick)
    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [onCancel])

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onKeyDown={handleKeyDown}
      >
        <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
        >
          <div className="mb-4 text-xl font-bold text-black dark:text-neutral-200">{prompt.name}</div>
          <div className="mb-4 text-sm text-black dark:text-neutral-200">{prompt.description}</div>

          {updatedPromptVariables.map((variable, index) => (
              <div className="mb-4" key={index}>
                <div className="mb-2 text-sm font-bold text-neutral-200">{variable.key}:</div>

                <textarea
                    ref={index === 0 ? nameInputRef : undefined}
                    className="mt-1 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                    style={{resize: "none"}}
                    placeholder={`${variable.key}...`}
                    value={variable.value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    rows={5}
                />
              </div>
          ))}

          <button
              className="mt-6 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
  )
}

export default PromptInputVars
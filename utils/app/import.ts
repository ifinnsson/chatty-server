import {
  getConversationsHistory,
  removeSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation
} from "@/utils/app/conversations"
import {getFolders, saveFolders} from "@/utils/app/folders"
import {trimForPrivacy} from "@/utils/app/privacy"
import {getPrompts, savePrompts} from "@/utils/app/prompts"
import {Conversation} from "@/types/chat"
import {FileFormatV4, LatestFileFormat, SupportedFileFormats} from "@/types/export"
import {FolderInterface} from "@/types/folder"
import {Prompt} from "@/types/prompt"


export const isLatestJsonFormat = isJsonFormatV4

export function isJsonFormatV4(obj: any): obj is FileFormatV4 {
  return obj.version === 4
}

export const upgradeDataToLatestFormat = (data: SupportedFileFormats): LatestFileFormat => {
  if (isJsonFormatV4(data)) {
    return data
  }
  throw new Error(`Unsupported data file format version: ${trimForPrivacy(JSON.stringify(data))}`)
}

export const isValidJsonData = (jsonData: any): string[] => {
  const errors = []
  if (!jsonData || typeof jsonData !== "object") {
    errors.push("Invalid JSON format; incorrect top-level structure, expected an object")
    return errors
  }
  const {version, history, folders, prompts} = jsonData
  if (
    typeof version !== "number" ||
    (history && !Array.isArray(history)) ||
    (folders && !Array.isArray(folders)) ||
    (prompts && !Array.isArray(prompts))
  ) {
    errors.push("Invalid file structure; expected version, history, folders and prompts keys")
    return errors
  }
  if (history) {
    for (const historyItem of history) {
      if (
        !historyItem.id ||
        typeof historyItem.name !== "string" ||
        !Array.isArray(historyItem.messages) ||
        typeof historyItem.model !== "object" ||
        typeof historyItem.prompt !== "string" ||
        typeof historyItem.temperature !== "number"
      ) {
        errors.push("Invalid history item format; expected id, name, messages, model, prompt and temperature keys")
        break
      }
      for (const message of historyItem.messages) {
        if (!message.role || typeof message.content !== "string") {
          errors.push("Invalid message format in history item; expected role and content keys")
          break
        }
      }
    }
  }
  return errors
}

// Import file and set the 'factory' value for all prompts to a new value (or remove it).
export const importJsonData = (
  data: SupportedFileFormats,
  newFactoryValue: boolean | null = null
): LatestFileFormat => {
  const {history: readHistory, folders: readFolders, prompts: readPrompts} = upgradeDataToLatestFormat(data)
  const newHistory = readHistory ?? []
  const newFactoryFolders =
      readFolders.filter((folder) => folder.factory).map((folder) => {
        folder.factory = newFactoryValue
        return folder
      }) ?? []
  const newUserFolders =
      readFolders.filter((folder) => !folder.factory).map((folder) => {
        folder.factory = newFactoryValue
        return folder
      }) ?? []
  const newFactoryPrompts =
    readPrompts
      .filter((prompt) => prompt.factory)
      .map((prompt) => {
        prompt.factory = newFactoryValue
        return prompt
      }) ?? []
  const newUserPrompts =
    readPrompts
      .filter((prompt) => !prompt.factory)
      .map((prompt) => {
        prompt.factory = newFactoryValue
        return prompt
      }) ?? []

  // Existing conversations are NOT overwritten.
  const existingConversationHistory = getConversationsHistory()
  const conversationHistory: Conversation[] = [...existingConversationHistory, ...newHistory].filter(
    (conversation, index, self) => index === self.findIndex((other) => other.id === conversation.id)
  )
  saveConversationsHistory(conversationHistory)
  if (conversationHistory.length > 0) {
    saveSelectedConversation(conversationHistory[conversationHistory.length - 1])
  } else {
    removeSelectedConversation()
  }

  // Existing folders are not overwritten.
  const userFolders = getFolders().filter((folder) => !folder.factory)
  const importedFolders: FolderInterface[] = [...newFactoryFolders, ...userFolders, ...newUserFolders].filter(
    (folder, index, self) => index === self.findIndex((other) => other.id === folder.id)
  )
  saveFolders(importedFolders)

  // Existing user prompts are not overwritten.
  const userPrompts = getPrompts().filter((prompt) => !prompt.factory)
  const importedUserPrompts: Prompt[] = [...userPrompts, ...newUserPrompts].filter(
    (prompt, index, self) => index === self.findIndex((other) => other.id === prompt.id)
  )
  const importedPrompts = [...newFactoryPrompts, ...importedUserPrompts]
  savePrompts(importedPrompts)

  return {
    version: 4,
    history: conversationHistory,
    folders: importedFolders,
    prompts: importedPrompts
  }
}
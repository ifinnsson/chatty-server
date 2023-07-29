import {Settings} from "@/types/settings"

export const STORAGE_KEY_SETTINGS = "settings"
export const STORAGE_KEY_API_KEY = "apiKey"
export const STORAGE_KEY_UNLOCK_CODE = "unlockCode"
export const STORAGE_KEY_SHOW_CHAT_BAR = "showChatBar"
export const STORAGE_KEY_SHOW_PROMPT_BAR = "showPromptBar"

export const getApiKey = () => localStorage.getItem(STORAGE_KEY_API_KEY)
export const removeApiKey = () => localStorage.removeItem(STORAGE_KEY_API_KEY)

export const getUnlockCode = () => localStorage.getItem(STORAGE_KEY_UNLOCK_CODE)
export const removeUnlockCode = () => localStorage.removeItem(STORAGE_KEY_UNLOCK_CODE)

export const getShowChatBar = () => {
  const value = localStorage.getItem(STORAGE_KEY_SHOW_CHAT_BAR)
  return value ? JSON.parse(value) : null
}
export const removeShowChatBar = () => localStorage.removeItem(STORAGE_KEY_SHOW_CHAT_BAR)

export const getShowPromptBar = () => {
  const value = localStorage.getItem(STORAGE_KEY_SHOW_PROMPT_BAR)
  return value ? JSON.parse(value) : null
}
export const removeShowPromptBar = () => localStorage.removeItem(STORAGE_KEY_SHOW_PROMPT_BAR)

export const getSettings = (): Settings => {
  let settings: Settings = {
    theme: "dark"
  }
  const settingsAsString = localStorage.getItem(STORAGE_KEY_SETTINGS)
  if (settingsAsString) {
    try {
      let savedSettings = JSON.parse(settingsAsString) as Settings
      settings = Object.assign(settings, savedSettings)
    } catch (error) {
      console.error(`Local storage error: ${error}`)
    }
  }
  return settings
}

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
}
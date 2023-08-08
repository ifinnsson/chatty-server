import {IconCheck, IconClipboard, IconDownload} from "@tabler/icons-react"
import {FC, memo, useState} from "react"
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import {oneDark, oneLight} from "react-syntax-highlighter/dist/cjs/styles/prism"
import {useTranslation} from "next-i18next"
import {useTheme} from "next-themes"
import {programmingLanguages} from "@/utils/app/codeblock"
import {generateFilename} from "@/utils/app/filename"


interface Props {
  language: string
  value: string
}

export const CodeBlock: FC<Props> = memo(({language, value}) => {
  const {t} = useTranslation("markdown")
  const {theme, setTheme} = useTheme()
  const [isCopied, setIsCopied] = useState<Boolean>(false)

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    })
  }
  const downloadAsFile = () => {
    const fileExtension = programmingLanguages[language] || ".txt"
    const fileName = `${generateFilename("code", fileExtension)}`
    const blob = new Blob([value], {type: "text/plain"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = fileName
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  return (
    <div className="codeblock relative font-sans text-[16px]">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-xs lowercase text-white">{language}</span>

        <div className="flex items-center">
          <button
            className="flex items-center gap-1.5 rounded bg-none p-1 text-xs text-white"
            onClick={copyToClipboard}
          >
            {isCopied ? <IconCheck size={18} /> : <IconClipboard size={18} />}
            {isCopied ? t("Copied!") : t("Copy code")}
          </button>
          <button className="flex items-center rounded bg-none p-1 text-xs text-white" onClick={downloadAsFile}>
            <IconDownload size={18} />
          </button>
        </div>
      </div>

      <SyntaxHighlighter language={language} style={theme === "dark" ? oneDark : oneLight} customStyle={{margin: 0}}>
        {value}
      </SyntaxHighlighter>
    </div>
  )
})

CodeBlock.displayName = "CodeBlock"
export default CodeBlock
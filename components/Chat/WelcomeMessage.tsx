import {useRouter} from "next/router"

export interface Props {}

export const WelcomeMessage = ({}: Props) => {
  const router = useRouter()

  return (
    <div className="mx-auto flex flex-col space-y-5 px-3 pt-5 md:space-y-10 md:pt-12">
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
        <div className="mx-auto flex flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center font-mono text-4xl font-extrabold text-gray-700 dark:text-gray-100">
            <span className="text-red-500">C</span>&nbsp;
            <span className="text-orange-500">H</span>&nbsp;
            <span className="text-yellow-500">A</span>&nbsp;
            <span className="text-green-700">T</span>&nbsp;
            <span className="text-blue-700">T</span>&nbsp;
            <span className="text-indigo-700">Y</span>&nbsp;
          </div>
          <div className="text-center font-mono text-xl font-bold text-gray-800 dark:text-gray-400">
            A better interface for Azure
            <p />
            and OpenAI GPT-3/GPT-4 models
          </div>
          <div className="text-center text-gray-700 dark:text-gray-400">
            <div>&nbsp;</div>
            <img src={`${router.basePath}/icon-256.png`} alt="icon" className="mx-auto mb-6 h-32 w-32" />
            <div>&nbsp;</div>
            <div className="font-light">Chatty is 100% unaffiliated with OpenAI.</div>
            <div>&nbsp;</div>
            <div className="font-light">You can start chatting in the box below.</div>
            <div className="font-light">Click on (?) in the top menu for instructions and release notes.</div>
          </div>
          <div className="text-center text-gray-600 dark:text-gray-400">- = o O o = -</div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeMessage
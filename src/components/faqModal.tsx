import { Modal } from "antd"
import Image from "next/image"
import CloseIcon from "../assets/svgs/close-icon.svg"
import { useState } from "react"

interface FaqModalProps {
  open: boolean
  onClose: () => void
}

const FAQS = [
  {
    question: "What is the minimum ZIL balance required to delegate?",
    answer: "The minimum required balance is 100 ZIL.",
  },
  {
    question: "Which wallets are supported on the Zillion staking platform?",
    answer: "You can use ZilPay, MetaMask, Rabby, and Ledger.",
  },
  {
    question: "How long is a reward cycle?",
    answer: "There is no fixed reward cycle. Rewards are distributed with every block.",
  },
  {
    question: "How long does unstaking take?",
    answer: "Unstaking takes 1,209,600 blocks, which is approximately 14 days, once the network returns to ~1 second block times.",
  },
  {
    question: "My transaction failed due to a low gas limit when claiming staking rewards. What should I do?",
    answer: "Try increasing the gas limit to 200,000 and then attempt to claim rewards again.\nEnsure your account has at least 400 ZIL to cover the transaction with this gas setting. Do not change any other gas parameters.",
  },
  {
    question: "I tried with a 200000 gas limit but the transaction still failed. What are the next steps?",
    answer: {
      pre: "Please contact us at enquiry@zilliqa.com. Include the following details in your message:",
      bullets: [
        "Your public ZIL address",
        "The SSN (staking service node) you used for staking",
      ],
      post: "We'll get back to you as soon as possible.",
    },
  },
  {
    question: "Why am I not able to unstake?",
    answer: "Ensure you have claimed all pending staking rewards first. Unstaking is only possible after that. Sometimes there may be dust rewards (very small amounts not visible in the UI), which can block unstaking. If unstaking fails, always try claiming rewards first.",
  },
  {
    question: "What is the difference between Liquid Staking and Non-Liquid Staking?",
    answer: "Liquid Staking: You receive exchangeable liquid tokens for your staked ZIL..\nNon-Liquid Staking: Your ZIL is locked with a validator. You earn rewards but do not receive liquid tokens.",
  },
  {
    question: "Is there a staking tutorial?",
    answer: "Yes. Please refer to the following tutorial: https://docs.zilliqa.com/staking",
  },
  {
    question: "Can we change delegators without unstaking first?",
    answer: "No. You must unstake first and wait for the unbonding period to complete. Only then can you delegate with a different validator. This mechanism helps secure the blockchain and prevents malicious activity.",
  },
]

// Helper to convert URLs in text to clickable links
function renderAnswerWithLinks(text: string) {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  // Split by URLs
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tealPrimary underline break-all"
        >
          {part}
        </a>
      )
    }
    // For line breaks
    return part.split(/\n/).map((line, j, arr) =>
      j < arr.length - 1 ? [line, <br key={j} />] : line
    )
  })
}

function renderFaqAnswer(answer: string | { pre: string; bullets: string[]; post?: string }) {
  if (typeof answer === "string") {
    return <div className="text-gray2 break-words whitespace-pre-line w-full">{renderAnswerWithLinks(answer)}</div>
  } else {
    return (
      <div className="text-gray2 break-words whitespace-pre-line w-full">
        {renderAnswerWithLinks(answer.pre)}
        <ul className="list-disc pl-6 my-2">
          {answer.bullets.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {answer.post && <div>{renderAnswerWithLinks(answer.post)}</div>}
      </div>
    )
  }
}

const FaqModal: React.FC<FaqModalProps> = ({ open, onClose }) => {
  const [isClickedClose, setIsClickedClose] = useState(false)

  const handleMouseDownClose = () => setIsClickedClose(true)
  const handleMouseUpClose = () => setIsClickedClose(false)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      closable={false}
      bodyStyle={{
        padding: 0,
        background: "#18181b",
        borderRadius: 18,
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.07)",
        maxHeight: 440,
        overflow: "hidden"
      }}
      className="dark-faq-modal"
    >
      {/* Validator-style Close Button with natural width and animated text */}
      <div
        onMouseDown={handleMouseDownClose}
        onMouseUp={handleMouseUpClose}
        onMouseLeave={handleMouseUpClose}
        onClick={onClose}
        className={`group rounded-160 bg-gray3 text-white cursor-pointer duration-500 ease-in-out h-8 p-2.5 flex flex-row-reverse items-center justify-center transition-all absolute top-5 right-5 z-10 hover:bg-gray2 ${isClickedClose ? "bg-gray2" : ""}`}
        tabIndex={0}
        role="button"
        aria-label="Close FAQ"
      >
        <Image
          className="flex-shrink-0 ml-0"
          src={CloseIcon}
          alt={"close icon"}
          width={12}
          height={12}
        />
        <div className="overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-16">
          <span className="ml-0.5 mr-2 text-sm text-white font-medium whitespace-nowrap inline-block transform translate-x-full group-hover:translate-x-0 transition-all duration-300 opacity-0 group-hover:opacity-100">
            Close
          </span>
        </div>
      </div>

      {/* Custom Header with Gradient Underline */}
      <div className="px-8 pt-8 pb-4 relative">
        <div className="body1 text-white">FAQ</div>
        <div className="h-0.5 w-24 mt-2 rounded" style={{ background: "linear-gradient(90deg, #00d0c6 0%, #522eff 100%)", opacity: 0.7 }} />
      </div>

      {/* FAQ List */}
      <div className="px-10 pb-10 max-h-[320px] overflow-y-auto overflow-x-hidden scrollbar-aqua">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="py-4 border-b border-white/10 last:border-0">
            <div className="bold20 break-words w-full mb-1">{faq.question}</div>
            {renderFaqAnswer(faq.answer)}
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default FaqModal 
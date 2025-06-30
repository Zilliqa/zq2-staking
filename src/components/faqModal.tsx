import { Modal, Tooltip } from "antd"
import Image from "next/image"
import CloseIcon from "../assets/svgs/close-icon.svg"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"

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
    answer:
      "There is no fixed reward cycle. Rewards are distributed with every block.",
  },
  {
    question: "How long does unstaking take?",
    answer:
      "Unstaking takes 1,209,600 blocks, which is approximately 14 days, once the network returns to ~1 second block times.",
  },
  {
    question:
      "My transaction failed due to a low gas limit when claiming staking rewards. What should I do?",
    answer:
      "Try increasing the gas limit to 200,000 and then attempt to claim rewards again.\nEnsure your account has at least 400 ZIL to cover the transaction with this gas setting. Do not change any other gas parameters.",
  },
  {
    question:
      "I tried with a 200000 gas limit but the transaction still failed. What are the next steps?",
    answer: {
      pre: "Please contact us at enquiry@zilliqa.com.\n\nInclude the following details in your message:",
      bullets: [
        "Your public ZIL address",
        "The SSN (staking service node) you used for staking",
      ],
      post: "We'll get back to you as soon as possible.",
    },
  },
  {
    question: "Why am I not able to unstake?",
    answer:
      "Ensure you have claimed all pending staking rewards first. Unstaking is only possible after that. Sometimes there may be dust rewards (very small amounts not visible in the UI), which can block unstaking. If unstaking fails, always try claiming rewards first.",
  },
  {
    question:
      "What is the difference between Liquid Staking and Non-Liquid Staking?",
    answer: [
      { type: "bold", content: "Liquid Staking:" },
      {
        type: "normal",
        content: " You receive exchangeable liquid tokens for your staked ZIL.",
      },
      { type: "break", content: "" },
      { type: "bold", content: "Non-Liquid Staking:" },
      {
        type: "normal",
        content:
          " Your ZIL is locked with a validator. You earn rewards but do not receive liquid tokens.",
      },
    ],
  },
  {
    question: "Is there a staking tutorial?",
    answer:
      "Yes. Please refer to the following tutorial: \nhttps://blog.zilliqa.com/how-to-restake-on-zilliqa-evm/",
  },
  {
    question: "Can we change delegators without unstaking first?",
    answer:
      "No. You must unstake first and wait for the unbonding period to complete. Only then can you delegate with a different validator. This mechanism helps secure the blockchain and prevents malicious activity.",
  },
]

// Add a slugify helper function to create URL-friendly IDs
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // replace spaces with -
}

// A single, unified component for handling both links and emails
function SmartLink({ link }: { link: string }) {
  const isEmail = link.includes("@")
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tooltipText = isEmail
    ? copied
      ? "Email address copied!"
      : "Copy to clipboard"
    : "Open in a new tab"

  return (
    <Tooltip title={tooltipText}>
      <a
        href={isEmail ? `mailto:${link}` : link}
        onClick={isEmail ? handleCopy : undefined}
        target={isEmail ? undefined : "_blank"}
        rel={isEmail ? undefined : "noopener noreferrer"}
        className="text-white underline hover:text-tealPrimary transition-colors break-all"
      >
        {link}
      </a>
    </Tooltip>
  )
}

// Helper to convert URLs and emails in text to clickable links
function renderAnswerWithLinks(text: string) {
  const parts: (string | JSX.Element)[] = []
  let lastIndex = 0
  const regex =
    /(https?:\/\/[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  let i = 0

  let match
  while ((match = regex.exec(text)) !== null) {
    const key = `part-${i++}`
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const matchedText = match[0]
    parts.push(<SmartLink key={key} link={matchedText} />)
    lastIndex = regex.lastIndex
  }

  // Add the remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  // Now process line breaks for all string parts
  return parts.flatMap((part, i) => {
    if (typeof part === "string") {
      return part.split("\n").map((line, j, arr) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ))
    }
    return part
  })
}

function renderFaqAnswer(
  answer:
    | string
    | { pre: string; bullets: string[]; post?: string }
    | Array<{ type: string; content: string }>
) {
  if (typeof answer === "string") {
    return (
      <div className="text-gray2 break-words whitespace-pre-line w-full">
        {renderAnswerWithLinks(answer)}
      </div>
    )
  } else if (Array.isArray(answer)) {
    // Handle the new array format for mixed styling
    return (
      <div className="text-gray2 break-words w-full">
        {answer.map((part, idx) => {
          if (part.type === "bold") {
            return <strong key={idx}>{part.content}</strong>
          }
          if (part.type === "break") {
            return <br key={idx} />
          }
          return <span key={idx}>{part.content}</span>
        })}
      </div>
    )
  } else {
    // Handle the bulleted list format
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
  const router = useRouter()
  const faqContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // When the modal opens and there's a specific faq in the query...
    if (
      open &&
      typeof router.query.faq === "string" &&
      router.query.faq !== "true"
    ) {
      setTimeout(() => {
        // Use a timeout to ensure the element is rendered
        const element = document.getElementById(router.query.faq as string)
        if (element) {
          // Use the modern, reliable way to scroll
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          /*
          // Highlight the linked question for better UX
          element.style.transition = "background-color 0.5s ease"
          element.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
          setTimeout(() => {
            element.style.backgroundColor = "transparent"
          }, 2000)
          */
        }
      }, 100)
    }
  }, [open, router.query.faq])

  const handleQuestionClick = (slug: string) => {
    // Update the URL to reflect the clicked question for easy sharing
    router.push({ query: { ...router.query, faq: slug } }, undefined, {
      shallow: true,
      scroll: false,
    })
  }

  const handleMouseDownClose = () => setIsClickedClose(true)
  const handleMouseUpClose = () => setIsClickedClose(false)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      bodyStyle={{
        padding: 0,
        background: "#18181b",
        borderRadius: 18,
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.07)",
        maxHeight: "70vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      className="dark-faq-modal w-[90%] max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-[1400px]"
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
      <div className="px-8 pt-8 pb-4 relative shrink-0">
        <div className="body1 text-white">FAQ</div>
        <div
          className="h-0.5 w-24 mt-2 rounded"
          style={{
            background: "linear-gradient(90deg, #00d0c6 0%, #522eff 100%)",
            opacity: 0.7,
          }}
        />
      </div>

      {/* FAQ List */}
      <div
        ref={faqContainerRef}
        className="grow px-10 pb-10 overflow-y-auto overflow-x-hidden scrollbar-aqua"
      >
        {FAQS.map((faq, idx) => {
          const slug = slugify(faq.question)
          return (
            <div
              key={idx}
              id={slug}
              className="py-4 border-b border-white/10 last:border-0 scroll-mt-8"
            >
              <div
                className="bold20 break-words w-full mb-1 cursor-pointer"
                onClick={() => handleQuestionClick(slug)}
              >
                {faq.question}
              </div>
              {renderFaqAnswer(faq.answer)}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export default FaqModal

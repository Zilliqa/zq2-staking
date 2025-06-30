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
    question: "What is Zilliqa staking?",
    answer:
      "Staking on Zilliqa allows you to delegate your ZIL tokens to validators and earn rewards while helping secure the network.",
  },
  {
    question: "How do I claim my staking rewards?",
    answer:
      "You can claim your rewards from the staking portal by clicking the 'Claim' button when rewards are available.",
  },
  {
    question: "Is there a minimum amount to stake?",
    answer:
      "Yes, there is a minimum staking amount. Please refer to the pool details for the exact value.",
  },
  {
    question: "How long does it take to unstake?",
    answer:
      "Unstaking periods may vary by pool. Please check the pool details for specific timings.",
  },
  {
    question: "Are my funds safe while staking?",
    answer:
      "Staking is generally safe, but always do your own research and choose reputable validators.",
  },
]

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
      <div className="px-10 pb-10 max-h-[320px] overflow-y-auto scrollbar-aqua">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="py-4 border-b border-white/10 last:border-0">
            <div className="semi14 xl:whitespace-nowrap mb-1">{faq.question}</div>
            <div className="text-gray2">{faq.answer}</div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default FaqModal 
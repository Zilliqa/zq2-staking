import { useState } from "react"
import { Button } from "antd"
import { WalletConnector } from "@/contexts/walletConnector"
import Header from "@/components/header"
import { useRouter } from "next/router"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"

const faqs = [
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

const FAQPage = () => {
  const router = useRouter()
  const { isWalletConnected } = WalletConnector.useContainer()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <>
      {/* Header */}
      <Header
        showBackButton={true}
        onBack={() => {}}
        title="Home Page"
        selectedPoolType={StakingPoolType.LIQUID}
        isWalletConnected={!!isWalletConnected}
        onClick={() => router.push("/")}
      />

      {/* Page Container */}
      <div className="min-h-screen max-h-screen overflow-y-auto text-white px-4">
        {/* Main Content */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
            FAQ
          </h1>
          <p className="text-lg text-gray-300 mb-8 text-center max-w-xl">
            Answers to common questions about Zilliqa Staking and the upcoming
            platform.
          </p>

          <div className="w-full max-w-2xl space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg relative group overflow-hidden transition-transform hover:scale-[1.01]"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex justify-between items-center text-left text-lg font-semibold text-white"
                >
                  {faq.question}
                  <span className="text-2xl">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <p className="mt-3 text-gray-200">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>

          {/* Follow Button */}
          <a
            href="https://x.com/zilliqa"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10"
          >
            <Button
              type="primary"
              className="btn-primary-teal px-10 py-2 text-lg font-bold rounded-full shadow-lg transition-transform duration-200 hover:scale-105"
            >
              Follow for Updates
            </Button>
          </a>
        </div>

        {/* Footer */}
        <footer className="w-full text-gray-500 text-sm text-center py-6">
          &copy; {new Date().getFullYear()} Zilliqa Staking
        </footer>
      </div>
    </>
  )
}

export default FAQPage

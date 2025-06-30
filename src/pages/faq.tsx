import Head from "next/head"
import { useState } from "react"
import Image from "next/image"
import logoUrl from "../assets/svgs/logo.svg"
import { Button } from "antd"
import Header from "@/components/header"

const faqs = [
  {
    question: "What is Zilliqa Staking?",
    answer:
      "Zilliqa Staking allows you to earn rewards by participating in the network's security and governance through token delegation.",
  },
  {
    question: "When will the new platform launch?",
    answer:
      "The new staking platform is scheduled to launch on June 30, 2025. Stay tuned for updates.",
  },
  {
    question: "What is Zilliqa 2.0?",
    answer:
      "Zilliqa 2.0 is an upgraded protocol version designed for better scalability, faster transactions, and EVM compatibility.",
  },
  {
    question: "Where can I find updates?",
    answer:
      "Follow our official Twitter account at https://x.com/zilliqa for the latest announcements and updates.",
  },
]

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <>
      <Head>
        <title>FAQ | Zilliqa Staking</title>
        <meta
          name="description"
          content="Frequently Asked Questions about Zilliqa Staking"
        />
      </Head>

      <div className="min-h-screen flex flex-col justify-between text-white px-4 relative overflow-hidden">
        {/* Logo */}
        <div className="w-full flex justify-center pt-8 pb-4">
          <Image src={logoUrl} alt="Logo" width={192} height={64} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
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

          {/* Button */}
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

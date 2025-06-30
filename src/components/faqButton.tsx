import { Button } from "antd"
import { useState } from "react"
import FaqModal from "@/components/faqModal"

const FaqButton = () => {
  const [open, setOpen] = useState(false)

  const handleFaqClick = () => {
    setOpen(true)
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          onClick={handleFaqClick}
          className="btn-primary-teal !w-10 !h-10 !text-2xl !p-0"
        >
          ?
        </Button>
      </div>
      <FaqModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default FaqButton 
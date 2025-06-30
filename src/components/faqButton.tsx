import { Button } from "antd"
import FaqModal from "@/components/faqModal"
import { useRouter } from "next/router"

const FaqButton = () => {
  const router = useRouter()
  // The modal is open if the `faq` query param exists.
  const isFaqOpen = !!router.query.faq

  const handleFaqClick = () => {
    // Open the modal by setting a generic query param.
    router.push({ query: { ...router.query, faq: "true" } }, undefined, {
      shallow: true,
    })
  }

  const handleClose = () => {
    // Close the modal by removing the `faq` query param from the URL.
    const { faq, ...rest } = router.query
    router.push({ query: rest }, undefined, { shallow: true })
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
      <FaqModal open={isFaqOpen} onClose={handleClose} />
    </>
  )
}

export default FaqButton

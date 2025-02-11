import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-[url('/static/stake-background.webp')] bg-right bg-no-repeat bg-cover bg-origin-content">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

import { Html, Head, Main, NextScript } from "next/document"
import Script from "next/script"

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-S4YVQXKJY8" />
        <Script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S4YVQXKJY8');
          `}
        </Script>

        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="max-h-screen overflow-hidden bg-[url('/static/stake-background.webp')] bg-right bg-no-repeat bg-cover bg-origin-content">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

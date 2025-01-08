import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-[url('/static/stake-background.webp')] bg-right bg-no-repeat bg-cover bg-origin-content">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

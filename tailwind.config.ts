import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",

        "aqua-blue":
          "linear-gradient(270deg, rgba(0, 208, 198, 0.80) -10.58%, rgba(82, 46, 255, 0.80) 158.65%)",

        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        "colorful-gradient":
          "linear-gradient(270deg, #00DABA 8%, #4AA1A3 23%, #8A7191 36%, #B15485 46%, #C14981 51%, #A73993 62%, #8726AA 78%, #741BB7 91%, #6D17BD 100%)",

        "grey-gradient":
          " linear-gradient(90deg, rgba(78, 78, 78, 0.3) -11.22%, rgba(32, 40, 50, 0.25) 47.4%, rgba(78, 78, 78, 0.3) 98.85%)",

        "aqua-gradient":
          "linear-gradient(90deg, rgba(124, 125, 126, 0.18) -11.22%, rgba(122, 131, 166, 0.15) 47.4%, rgba(124, 125, 126, 0.18) 98.85%)",

        "aqua-grey-gradient":
          "linear-gradient(180deg, var(--grey-black, #000) 33%, rgba(0, 0, 0, 0.00) 100%)",

        "custom-grey-gradient":
          "linear-gradient(90deg, rgba(78, 78, 78, 0.30) 0%, rgba(32, 40, 50, 0.25) 49%, rgba(78, 78, 78, 0.30) 92%)",

        "gray-grad": "linear-gradient(90deg, #212020 0%, #2d2c2c 100%)",

        "gray-gradient":
          "linear-gradient(90deg, rgba(78, 78, 78, 0.30) 0%, rgba(32, 40, 50, 0.25) 50%, rgba(78, 78, 78, 0.30) 92%)",

        "focus-gradient":
          "linear-gradient(90deg, rgba(57, 35, 162, 0.20) 0%, rgba(19, 136, 130, 0.20) 100%)",

        "teal-gradient":
          "linear-gradient(90deg, rgba(23, 60, 63, 0.40) -2.48%, rgba(23, 60, 63, 0.25) 99.35%)",

        "purple-gradient":
          "linear-gradient(90deg, rgba(83, 57, 211, 0.30) -17.49%, rgba(83, 57, 211, 0.15) 90.6%)",

        "red-gradient":
          "linear-gradient(90deg, rgba(255, 74, 74, 0.30) -12.7%, rgba(255, 74, 74, 0.20) 66.28%)",
      },
      colors: {
        white1: "#E1E2E2",

        gray1: "#BBBBBB",
        gray2: "#707070",
        gray3: "#454545",

        black1: "#202025",

        tealPrimary: "#00D0C6",
        teal1: "#173C3F",
        teal2: "#051B1D",

        purple1: "#DCD5FF",
        purple2: "#87A1FF",
        purple3: "#5B6FFF",
        purplePrimary: "#522EFF",
        purple4: "#2B2970",
        purple5: "#19152D",

        orange1: "#FE9950",

        red1: "#FF4A4A",
      },
      fontSize: {
        "8": "0.5rem",
        "10": "0.625rem",
        "11": "0.688rem",
        "13": "0.813rem",
      },
      borderRadius: {
        "10": "10px",
        "160": "160px",
        "2.5xl": "1.25rem",
      },
      screens: {
        xxs: "380px",
        xs: "450px",
        "4k": "2380px",
      },
      backdropBlur: {
        "17": "17px",
      },
    },
  },
  plugins: [],
}
export default config

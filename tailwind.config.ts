import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: ["h3-inactive"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "primary-gradient":
          "radial-gradient(120.62% 683.52% at 110.84% 156.15%, #C5FFFD 6.84%, rgba(111, 255, 194, 0.760784) 48.36%, #00DABA 100%)",
        gradientbg:
          "linear-gradient(129.93deg, rgba(175, 175, 175, 0.12) 16.6%, rgba(17, 243, 179, 0.12) 90.65%)",
        darkbg:
          "linear-gradient(314.92deg, rgba(17, 39, 49, 0.4) 28.08%, rgba(9, 9, 9, 0.4) 97.04%)",
        "colorful-gradient":
          "linear-gradient(270deg, #00DABA 8%, #4AA1A3 23%, #8A7191 36%, #B15485 46%, #C14981 51%, #A73993 62%, #8726AA 78%, #741BB7 91%, #6D17BD 100%)",
        "grey-gradient":
          " linear-gradient(90deg, rgba(78, 78, 78, 0.3) -11.22%, rgba(32, 40, 50, 0.25) 47.4%, rgba(78, 78, 78, 0.3) 98.85%)",
        "aqua-gradient":
          "linear-gradient(90deg, rgba(124, 125, 126, 0.18) -11.22%, rgba(122, 131, 166, 0.15) 47.4%, rgba(124, 125, 126, 0.18) 98.85%)",

      },
      colors: {
        black1: "#010101",
        black2: "#202025",
        black3: "#545454",
        black4: "#1E1D1D",

        gray1: "#555555",
        gray2: "#454545",
        gray3: "#706F6F",
        gray4: "#4B4B4B",
        gray5: "#AEAEAE",
        gray6: "#B5B5B5",
        gray7: "#A09D9D",
        gray8: "#707070",
        gray9: "#BBBBBB",
        gray10: "#7C7C7C",
        gray11: "#858A8A",

        white1: "#F1F4F4",
        white2: "#F7FBFA",
        white3: "#E1E2E2",
        white4: "#D7D8D8",

        blue1: "#1966F7",

        aqua1: "#00D0C6",
        aqua2: "#6DD3C2",
        aqua3: "#BCE6EC",
        aqua4: "#00D0C633",
        aqua5: "#173C3F",

        purple1: "#7839FF",
        purple2: "#B9A9FB",
        purple3: "#87A1FF",
        purple4: "#2B2970",

        orange1: "#FE9950",

        red1: "#D92D20",
        red2: "#FF4A4A",
      },
      fontSize: {
        "10": "10px",
        "12": "12px",
        "14": "14px",
        "13": "13px",
        "15": "15px",
        "16": "16px",
        "17": "17px",
        "18": "18px",
        "20": "20px",
        "22": "22px",
        "24": "24px",
        "26": "26px",
        "27": "27px",

        "28": "28px",

        "30": "30px",
        "32": "32px",
        "38": "38px",
        "40": "40px",
        "48": "48px",
        "58": "58px",

        "64": "64px",
        "80": "80px",
        "114": "114px",
      },
      borderRadius: {
        "10": "10px",
        "160": "160px",

        "2.5xl": "1.25rem",
      },
      lineHeight: {
        "11": "44px",
        "12": "48px",
        "14.5": "58px",

        "16": "64px",
        "20": "80px",
      },
      padding: {
        "5": "20px",
        "7.5": "30px",
        "9.5": "38px",
        "4.5": "18px",
        "17.5": "70px",

        "21": "84px",
      },
      margin: {
        "7.5": "30px",
        "9.5": "38px",
        "4.5": "18px",
        "12.5": "50px",
        "15": "60px",

        "21": "84px",
      },
      screens: {
        xs: "450px",
      },
    },
  },
  plugins: [],
}
export default config

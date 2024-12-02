import type { Config } from "tailwindcss";

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
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        black1: '#010101',
        black2: '#202025',
        gray1: '#555555',
        gray2: '#686A6C',
        gray3: '#A6AEAD',
        gray4: '#E1E2E2',
        white1: '#F1F4F4',
        white2: '#F7FBFA', 

        blue1: '#1966F7',
        aqua1: '#00D0C6',
        aqua2: '#6DD3C2',
        aqua3:'#BCE6EC',
        purple1:'#7839FF',
        purple2:'#B9A9FB',

        orange1:'#DC6803',
        red1:'#D92D20'
      },
      fontSize:{
        '14': '14px',
        '15': '15px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
        '80': '80px',
        '104': '104px'
      },
      fontFamily: {
        "int-light": "interLight",
        "int-regular": "interRegular",
        "int-medium": "interMedium",
        "int-semibold": "interSemiBold",
        "int-bold": "interBold",
        "int-extrabold": "interExtraBold",
      },
      borderRadius: {
        '10': "10px"
      },
      letterSpacing: {
        '-2': '-2%',
        '-1': '-1%',
        '1': '1%',
        '2': '2%'
      },
      lineHeight:{
        '11': '44px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '26': '104px'
      },
      padding:{
        '7.5': '30px'
      }
    },
  },
  plugins: [],
};
export default config;

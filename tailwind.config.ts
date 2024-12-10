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
        'primary-gradient' : 'radial-gradient(120.62% 683.52% at 110.84% 156.15%, #C5FFFD 6.84%, rgba(111, 255, 194, 0.760784) 48.36%, #00DABA 100%)',
        'gradientbg': 'linear-gradient(129.93deg, rgba(175, 175, 175, 0.12) 16.6%, rgba(17, 243, 179, 0.12) 90.65%)',
        'darkbg': 'linear-gradient(314.92deg, rgba(17, 39, 49, 0.4) 28.08%, rgba(9, 9, 9, 0.4) 97.04%)',
 
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
        '10': '10px',
        '12': '12px',
        '14': '14px',
        '15': '15px',
        '16': '16px',
        '17': '17px',
        '18': '18px',
        '20': '20px',
        '24': '24px',
        '27': '27px',
        '30': '30px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
        '80': '80px',
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
        '10': "10px",
        '2.5xl' : '1.25rem'
      }, 
      lineHeight:{
        '11': '44px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
       },
      padding:{
        '7.5': '30px',
        '4.5': '18px',
        '21': '84px'
      },
      margin:{
        '7.5': '30px',
        '4.5': '18px',
        '12.5': '50px',
        '21': '84px',
      },
      screens:{
        xs: '450px'
      }
    },
  },
  plugins: [],
};
export default config;

// pages/index.tsx

import { useState } from 'react';
import { Button } from 'antd';
import { DownOutlined, UserOutlined, MenuOutlined, SearchOutlined, BellOutlined, RightOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';

const HomePage = () => {
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">

      <header className="flex items-center justify-between p-4 bg-black text-white">
        <div className="flex items-center">
          <img src="https://zil-dev.cdn.prismic.io/zil-dev/f3b97b97-e98b-4767-9b24-9474b9c20a83_Asset+1.svg" alt="Zilliqa Logo" className="h-8 w-auto" />
        </div>

        <div className="flex items-center space-x-4">
          <SearchOutlined className="text-xl" />
          <a href="#" className="hover:underline">
            HELP
          </a>
          <a href="#" className="hover:underline">
            DEV DOCS
          </a>
          <BellOutlined className="text-xl" />
          <UserOutlined className="text-xl" />
          <MenuOutlined className="text-xl" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Side */}
        <div className="w-1/3 bg-black text-white p-8">
          {/* Offers Section */}
          <div>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsOffersOpen(!isOffersOpen)}
            >
              <h2 className="text-xl font-bold">Offers</h2>
              <DownOutlined />
            </div>
            {isOffersOpen && (
              <div className="mt-4">
                {/* Offers content goes here */}
              </div>
            )}
          </div>

          {/* Calculator Section */}
          <div className="mt-8">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            >
              <h2 className="text-xl font-bold">Calculator</h2>
              <DownOutlined />
            </div>
            {isCalculatorOpen && (
              <div className="mt-4">
                {/* Calculator content goes here */}
              </div>
            )}
          </div>

          {/* Connect Wallet Button */}
          <div className="mt-8">
            <Button
              type="primary"
              className="w-full"
            >
              Connect Wallet First
            </Button>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-2/3 relative flex items-center justify-center">
          {/* Background Graphic */}
          <div className="absolute inset-0">
            <img
              src="/background-graphic.jpg"
              alt="Background Graphic"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Content */}
          <div className="relative text-center text-white p-8">
            <h1 className="text-4xl font-bold">Liquid Staking with Zilliqa</h1>
            <p className="mt-4 text-lg">
              Help us Empower and secure the Zilliqa Chain
            </p>
            <Button
              type="primary"
              size="large"
              className="mt-8 bg-teal-500 border-none hover:bg-teal-600"
            >
              SIGN IN / CONNECT WALLET<RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

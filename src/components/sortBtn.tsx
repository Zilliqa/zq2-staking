import React, { useState } from 'react'; 

interface SortBtnProps {
  variable: String;
  isClicked: Boolean;
  onClick: () => void;
}

const SortBtn: React.FC<SortBtnProps> = ({ variable, isClicked, onClick }) => {
 

  return (
    <div 
    className="btn-secondary-gray group"       
    onClick={onClick}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`duration-700 stroke-gray1 group-hover:stroke-white ease-in-out ${isClicked ? 'scale-y-[-1]' : ''}`}
      >
        <path
          d="M16 3V21"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 16L16 21L21 16"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 4H11"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 8H11"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 12H11"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="base ml-2 duration-700 group-hover:text-white ease-in-out">
        {variable}
      </div>
    </div>
  );
};

export default SortBtn;

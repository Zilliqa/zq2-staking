import React, { useState } from "react"
import { Tooltip } from "antd"
interface SortBtnProps {
  variable: String
  isClicked: Boolean
  onClick: () => void
  tooltip: String
}

const SortBtn: React.FC<SortBtnProps> = ({
  variable,
  isClicked,
  onClick,
  tooltip,
}) => {
  return (
    <Tooltip
      placement="top"
      arrow={true}
      overlayClassName="custom-tooltip"
      title={tooltip}
    >
      <div className="btn-filter group" onClick={onClick}>
        <svg
          width="13"
          height="10"
          viewBox="0 0 13 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`duration-700 stroke-gray1 group-hover:stroke-white ease-in-out ${
            isClicked ? "scale-y-[-1]" : ""
          }`}
        >
          <path
            d="M8.95428 1L8.95429 8.84943"
            stroke="white"
            strokeWidth="0.535854"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.9953 5.8905L8.95425 8.84945L11.9132 5.8905"
            stroke="white"
            strokeWidth="0.535854"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0.999878 1.9657H6.91777"
            stroke="white"
            strokeWidth="0.535854"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.97247 3.93835H6.91773"
            stroke="white"
            strokeWidth="0.535854"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="small-base ml-1 duration-700 group-hover:text-white ease-in-out">
          {variable}
        </div>
      </div>
    </Tooltip>
  )
}

export default SortBtn

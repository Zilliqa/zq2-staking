import React, { useState } from "react"
import { Tooltip } from "antd"
interface SortBtnProps {
  liquidType: Boolean
  variable: String
  isClicked: Boolean
  onClick: () => void
  tooltip: String
}

const SortBtn: React.FC<SortBtnProps> = ({
  liquidType,
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
      <div
        className={`btn-filter group  ${isClicked ? (liquidType ? "bg-aqua6" : "bg-purple4") : ""}`}
        onClick={onClick}
      >
        <svg
          width="14"
          height="12"
          viewBox="0 0 14 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`duration-700 stroke-gray1 group-hover:stroke-white ease-in-out ${
            isClicked ? "scale-y-[-1]" : ""
          }`}
        >
          <path
            d="M9.625 10.9487L9.625 0.999985"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.8945 7.68873L9.62453 10.9487L6.35453 7.68873"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 1L7.5 0.999999"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 3.375L7.5 3.375"
            stroke="white"
            strokeMiterlimit="10"
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

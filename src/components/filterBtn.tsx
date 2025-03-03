import React, { useState } from "react"

interface FilterBtnProps {
  variable: String
  onClick: () => void
  isActive: boolean
  activeGradient: string
}

const FilterBtn: React.FC<FilterBtnProps> = ({
  variable,
  onClick,
  isActive,
  activeGradient,
}) => {
  return (
    <div
      className={`btn-filter group ${isActive ? activeGradient : "not-active"}`}
      onClick={onClick}
    >
      <div className="small-base px-2 duration-300 group-hover:text-white ease-in-out">
        {variable}
      </div>
    </div>
  )
}

export default FilterBtn

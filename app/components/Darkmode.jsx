"use client"
import React from 'react'
import { MdDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import { Dropdown, DropdownItem } from 'flowbite-react';
import { useDarkMode } from '../context/DarkModeProvider';

const Darkmode = () => {
    const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Dropdown arrowIcon={true} inline label={
        <span className="flex items-center space-x-2">
          {darkMode ? <MdDarkMode size={18} className="dark:text-gray-300"/> : <CiLight size={18} className="dark:text-gray-300" />}
          <span className="dark:text-gray-300">{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </span>
      }>
  <DropdownItem>
    <div className="flex items-center gap-x-2">
    {darkMode ? <CiLight size={18} /> : <MdDarkMode size={18} />}
      <span onClick={toggleDarkMode}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
    </div>
  </DropdownItem>
</Dropdown>
  )
}

export default Darkmode
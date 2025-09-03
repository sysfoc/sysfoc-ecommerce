/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        // Main theme colors for entire application
        theme: {
          // Backgrounds
          'bg-light': '#f3f4f6',        // gray-100 equivalent
          'bg-dark': '#374151',         // gray-700 equivalent
          'surface-light': '#ffffff',   // white backgrounds
          'surface-dark': '#1f2937',    // dark surfaces
          
          // Text colors
          'text-primary-light': '#111827',  // Primary text in light mode
          'text-primary-dark': '#ffffff',   // Primary text in dark mode
          'text-secondary-light': '#4b5563', // gray-600 equivalent
          'text-secondary-dark': '#d1d5db',  // gray-300 equivalent
          'text-muted-light': '#6b7280',     // gray-500 for muted text
          'text-muted-dark': '#9ca3af',      // gray-400 for muted text dark
          
          // Buttons & Interactive Elements
          'primary': '#3b82f6',         // Primary button color (blue-500)
          'primary-hover': '#2563eb',   // Primary button hover (blue-600)
          'primary-dark': '#1d4ed8',    // Primary button pressed (blue-700)
          'secondary': '#6b7280',       // Secondary button (gray-500)
          'secondary-hover': '#4b5563', // Secondary button hover (gray-600)
          
          // Interactive states
          'hover-light': '#1f2937',     // gray-900 for hover states
          'hover-bg-light': '#f9fafb',  // Light hover background
          'hover-bg-dark': '#374151',   // Dark hover background
          'border-light': '#d1d5db',    // gray-300 for borders
          'border-dark': '#4b5563',     // gray-600 for dark borders
          
          // Status colors (essential ones)
          'success': '#10b981',         // green-500
          'error': '#ef4444',           // red-500
          'warning': '#f59e0b',         // amber-500
        },
        
        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",
      }
    },
  },
  plugins: [flowbite.plugin()],
  darkMode: 'class', // Ensure dark mode is enabled
};
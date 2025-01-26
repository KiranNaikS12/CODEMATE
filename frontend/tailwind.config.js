/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        themeColor: '#2A2A48',
        customGrey: '#D8D8FD',
        highlightBlue: '#3D3D7E',
        hoverColor:'#247cff'
      },
      screens: {
        'xs': '425px',
        'xxs': '375px'
      },
      fontFamily: {
        'rubik-wet-paint': ['"Rubik Wet Paint"', 'system-ui'],
        'nabla': ['"Nabla"', 'serif'],
        'pirata': ['"Pirata One"', 'serif'],
        'playwrite': ['Playwrite IN', 'serif']
      },
      boxShadow: {
        'left': '-4px 0px 10px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [
    require('flowbite/plugin'), 
  ],
}


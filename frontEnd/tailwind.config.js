/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-purple": "#081A51",
        "light-white": "rgba(255,255,255,0.17)",
        "LightGray" :"#D3D3D3",
        "KKU" : "#A73B24",
        "blue" :"#283593",
        "LightGray": '#f5f5f5',
        "Black" : '#000000',
        "blue2":'#003399',
        "lightblue": '#66ccff',
        "darkblue" : '#003399',
        "blue3":'#303f9f',
        "yelloww": "rgb(228, 205, 52)",
        "redd": "rgb(228, 90, 52)",
      },
      fontFamily: {
        sans: ['Prompt', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
        kanit: ['Kanit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
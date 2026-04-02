/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0A0A0A', // Deep Black
                    800: '#121212', // Off Black
                    700: '#1C1C1C', // Soft Black
                },
                primary: {
                    DEFAULT: '#CCFF00', // Neon Lime
                    hover: '#B3E600',
                    dim: 'rgba(204, 255, 0, 0.1)',
                },
                accent: {
                    purple: '#BD00FF', // Electric Purple
                    blue: '#00D1FF',   // Cyan
                },
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.03)',
                    hover: 'rgba(255, 255, 255, 0.08)',
                    border: 'rgba(255, 255, 255, 0.08)',
                    heavy: 'rgba(255, 255, 255, 0.08)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 10px -5px rgba(204, 255, 0, 0.3)' },
                    'to': { boxShadow: '0 0 25px 5px rgba(204, 255, 0, 0.3)' },
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #BD00FF 0deg, #00D1FF 180deg, #CCFF00 360deg)',
            }
        },
    },
    plugins: [],
}

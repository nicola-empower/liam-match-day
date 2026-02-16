import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['liam-favicon.jpg'],
      manifest: {
        name: "Liam's Stadium",
        short_name: 'LiamFC',
        description: 'Track your daily matches and training!',
        theme_color: '#00853f',
        icons: [
          {
            src: 'liam-favicon.jpg',
            sizes: '192x192', // ideally we have resized versions, but using the source for now
            type: 'image/jpeg'
          },
          {
            src: 'liam-favicon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
})

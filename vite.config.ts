// Arquivo: vite.config.ts (DEPOIS)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 1. Importe o plugin

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // 2. Adicione a configuração do PWA
      registerType: 'autoUpdate',
      manifest: {
        name: 'Meu Treino',
        short_name: 'MeuTreino',
        description: 'Seu aplicativo pessoal para acompanhamento de treinos.',
        theme_color: '#1e293b', // Cor de fundo da barra de status no celular
        icons: [
          {
            src: 'pwa-192x192.png', // Caminho para o ícone na pasta 'public'
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Caminho para o ícone na pasta 'public'
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
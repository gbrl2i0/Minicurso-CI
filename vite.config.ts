import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Servido em kessleru.com.br/ci: o portfólio repassa /ci/* para este projeto (sem o /ci).
// Com base '/ci/', o navegador pede os arquivos em /ci/assets/..., que o portfólio também repassa.
export default defineConfig({
  base: '/ci/',
  plugins: [react(), tailwindcss()],
});

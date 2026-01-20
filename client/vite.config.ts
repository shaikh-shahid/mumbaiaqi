import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

// Copy data files to public directory during build
function copyDataFiles() {
  return {
    name: 'copy-data-files',
    buildStart() {
      const dataDir = join(__dirname, '..', 'data');
      const publicDir = join(__dirname, 'public');
      
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
      }
      
      const dataFilesDir = join(publicDir, 'data');
      if (!existsSync(dataFilesDir)) {
        mkdirSync(dataFilesDir, { recursive: true });
      }
      
      if (existsSync(dataDir)) {
        const dataFiles = readdirSync(dataDir).filter(f => f.endsWith('.json'));
        dataFiles.forEach(file => {
          const src = join(dataDir, file);
          const dest = join(dataFilesDir, file);
          copyFileSync(src, dest);
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyDataFiles()],
  server: {
    port: 3000
  },
  publicDir: 'public',
  base: './' // Use relative paths for deployment
});

import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/entry.js',
      name: 'Widget',
      // 这个配置项是不能改的，因为后面读取文件会根据这个名字找文件
      fileName: 'widget'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          "react": 'React',
          "react-dom": "ReactDOM"  
        }
      }
    }
  },
  plugins: [reactRefresh()]
})

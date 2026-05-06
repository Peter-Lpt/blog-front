import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: env.VITE_API_PROXY_TARGET,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
        css: {
            preprocessorOptions: {
                scss: {},
            },
        },
    }
})

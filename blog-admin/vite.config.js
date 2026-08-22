import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/admin/',
        plugins: [
            vue(),
            AutoImport({ resolvers: [ElementPlusResolver()] }),
            Components({ resolvers: [ElementPlusResolver()] }),
        ],
        resolve: {
            alias: { '@': resolve(__dirname, 'src') },
        },
        server: {
            port: 3001,
            proxy: {
                '/api': {
                    target: env.VITE_API_PROXY_TARGET || 'http://localhost:8001',
                    changeOrigin: true,
                    rewrite: function (path) { return path.replace(/^\/api/, ''); },
                },
                // 头像等用户上传文件直连后端静态资源
                '/uploads': {
                    target: env.VITE_API_PROXY_TARGET || 'http://localhost:8001',
                    changeOrigin: true,
                },
                // 预设头像静态资源（位于 blog-front/public/avatars）
                // dev 下前台跑在 4321；生产同域由 nginx 直接服务，无需代理
                '/avatars': {
                    target: 'http://localhost:4321',
                    changeOrigin: true,
                },
            },
        },
    };
});

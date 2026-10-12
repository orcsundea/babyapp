import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig(({mode})=>({
 resolve:{alias:mode==='web'?[{find:/^\.\/native\.js$/,replacement:fileURLToPath(new URL('./src/web.js',import.meta.url))}]:[]},
}));

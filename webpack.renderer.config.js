import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname 的 ES Module 实现方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development', // 新增模式配置
    target: 'electron-renderer',
    entry: './src/js/renderer/mainControl.js',
    output: {
        filename: 'renderer.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    }
};
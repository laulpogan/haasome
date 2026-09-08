import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'*.spec.js',workers:1,timeout:120000,use:{baseURL:process.env.PALACE_BASE_URL || 'http://127.0.0.1:4173',viewport:{width:1440,height:1000},headless:true,launchOptions:{args:process.platform === 'darwin' ? ['--use-angle=metal'] : []}}});

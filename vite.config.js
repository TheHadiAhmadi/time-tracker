import { sveltekit } from "@sveltejs/kit/vite";
import windicss from "vite-plugin-windicss";

const config = {
  plugins: [sveltekit(), windicss()],
};

export default config;

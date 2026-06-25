export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                void: "#05070a",
                panel: "#0b1118",
                panelHigh: "#111923",
                line: "#243241",
                cyan: "#21d4f3",
                blue: "#2e83ff",
                amber: "#f6b13d",
                danger: "#ff5a67"
            },
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
            }
        }
    },
    plugins: []
};

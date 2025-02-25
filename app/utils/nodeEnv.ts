const dev = "https://attend-forum-server-dev-1-0.onrender.com/api";
const local = "http://localhost:5000/api";

export function getCurrentEnv(env: "dev" | "local"): string {
    return env === "dev" ? dev : local;
}



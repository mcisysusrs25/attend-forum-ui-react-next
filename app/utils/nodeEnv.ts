const dev_test_url = "https://attend-forum-server-dev-1-0.onrender.com/api";
const local_url1 = "https://attend-forum-server-dev-1-0.onrender.com/api";
const local_url2 = "http://localhost:5000/api";

export function getCurrentEnv(env: "dev" | "local"): string {
    return env === "dev" ? local_url2 : local_url2;
}



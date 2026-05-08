export function getWsUrl() {
    if (typeof window === "undefined") return "";
    const fromEnv = process.env.NEXT_PUBLIC_WS_URL;
    if (fromEnv && fromEnv.length > 0) return fromEnv;
    // Dev rule: if FE runs on :3000 (localhost/LAN IP), WS backend is :3001.
    if (window.location.port === "3000") {
        return `ws://${window.location.hostname}:3001/ws`;
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
}

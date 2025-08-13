

export const restApiBaseURL: string = import.meta.env.VITE_REST_API_BASE_URL || "http://localhost:8000";
// export const graphqlApiBaseURL: string = import.meta.env.VITE_GRAPHQL_API_BASE_URL || "http://localhost:8000/graphql";

export function logViteEnvironment() {
    console.log(`Using REST API URL: ${restApiBaseURL}`);
    // console.log(`Using GraphQL API URL: ${graphqlApiBaseURL}`);
    
    console.log("🔧 Vite Build Environment:");
    console.log("🌍 VITE_API_URL:", restApiBaseURL);
    console.log("🛠 Mode:", import.meta.env.MODE);
    console.log("🚀 PROD:", import.meta.env.PROD);
    console.log("🔄 DEV:", import.meta.env.DEV);
    console.log("📂 BASE_URL:", import.meta.env.BASE_URL);
    console.log("🔢 VITE_API_PORT:", import.meta.env.VITE_API_PORT);
}
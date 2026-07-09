import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api"
});

//add access token to each request made
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    // console.log("TOKEN", token)

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // console.log("headers:", config.headers.Authorization)
    return config
});

//refreshes expired tokens automatically
api.interceptors.response.use(
    
    (response) => response,

    
    async (error) => {

        const originalRequest = error.config
        // only try this if error is 401
        //not been retried already

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refresh");

            if (refreshToken) {
                try {
                    console.log("refreshing token");
                    const response = await api.post("/refresh/", {
                        refresh: refreshToken
                    });
                    const newAccessToken = response.data.access;

                    localStorage.setItem("access", newAccessToken);

                    //update fail request with newaccesstoken
                    originalRequest.headers.Authorization = 
                    `Bearer ${newAccessToken}`;
console.log("tokens refreshed")
                    //retry the OG request
                    return api(originalRequest)
                    
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);

                    localStorage.removeItem("access")
                    localStorage.removeItem("refresh")
                }
            }
        }
    }
)

export default api;
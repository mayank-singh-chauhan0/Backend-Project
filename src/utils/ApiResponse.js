class ApiResponse {
    constructor(statusCode, message="Sucess", data) {
        this.message = message;
        this.data = data;
        this.statusCode=statusCode;
        this.success = statusCode <400;

    }

}
export {ApiResponse};
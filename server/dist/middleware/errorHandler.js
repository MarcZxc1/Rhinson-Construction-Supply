export class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
    }
    // Log unexpected errors
    console.error("Unexpected error:", err);
    // Don't leak error details in production
    const message = process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message;
    return res.status(500).json({
        status: "error",
        message,
    });
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: "error",
        message: `Route ${req.originalUrl} not found`,
    });
};
//# sourceMappingURL=errorHandler.js.map
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack  = ""
    ){  // overwritng the details
        super(message) // super(message) is used inside a class constructor to call the parent class's constructor (Error in this case).
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false  // flag
        this.errors = errors

        if(stack){
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }
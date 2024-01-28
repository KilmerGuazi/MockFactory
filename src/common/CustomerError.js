
/**
 * 变量id错误
 */
 class InvalidVariableIdError extends Error {

    constructor(id) {
        super()
        this.id = id
        this.message = `变量id ${id}异常`
        this.name = 'InvalidVariableIdError'
    }
}

/**
 * 查询变量信息错误
 */
class QueryVariableError extends Error{
    constructor(message){
        super(message)
        this.name = 'QueryVariableError'
    }
}

export {
    InvalidVariableIdError,
    QueryVariableError
}
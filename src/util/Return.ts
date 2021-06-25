type CustomError = { code: number, message: string } | Error | null
type ReturnTupple<T> = [CustomError, T]

export class Return<T> {
    error: CustomError
    payload: T | null
    constructor(error: CustomError, payload: T | null) {
        this.error = error
        this.payload = payload
    }
    getAsTupple = () => [
        this.error as CustomError,
        this.payload as T | null
    ] as ReturnTupple<T | null>
}
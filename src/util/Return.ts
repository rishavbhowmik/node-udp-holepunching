type CustomError = { code: number, message: string } | Error | null
type ReturnTupple<T> = [CustomError, T]

export class Return<T> {
    error: CustomError
    payload: T
    constructor(error, payload) {
        this.error = error
        this.payload = payload
    }
    getAsTupple = () => [
        this.error as CustomError,
        this.payload as T
    ] as ReturnTupple<T>
}
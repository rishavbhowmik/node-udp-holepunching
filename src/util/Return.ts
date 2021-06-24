export type Return = [
    /**
     * ### Error
     */
    { code: number, message: string } | Error | null,
    /**
     * ### Payload
     */
    any | null
]
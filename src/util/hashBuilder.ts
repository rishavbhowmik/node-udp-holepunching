import { createHash } from "crypto"

const HASH_KEYS = [
    'B++0i1X8SkyS44C2riQpPJJsJWKaNkNkqeiPjDZyUH8=',
    'q1yta/5LTxeafLPglTvgwsB03jBrBEPco2KGoWNDaKA=',
    'uJvxUox3QXy8xOjT6J2z/PXze9mT/Eo4hu5wU2TZzoU=',
    'ZyIFHa6XR6uq9dXRmk8CE/ouAvCOZEC8lxfpabHNPdU=',
    'd66tes6oQhKoUPJrdI2CdfImWA8VPU/dg+KtYGur1z4=',
    'F2zW2DwqR3aAmg2Z8/V3aQcXeF8dWE/yu8rb1kt8nvY=',
    '4fJw7MNmR1CVA8H1pH/Udxz4Xrw9bUR9iJf8hKITBUc=',
    'mRKMHaU9SdCVAFkx5ZfCt0GzbrTQkk02uaqYrQ2oBuY=',
    'JI5EyZNAQe6dMjDpPZrNb9BOUtzCxUXrkPjbtiOYF5I=',
    'fTvamHqeRyKhJObiqGr32T13RiN3a09cvvPvoxzX948='
]

export const hashBuilder = (data: string | Buffer) => {
    const hash = createHash('sha256')
    hash.update(data)
    HASH_KEYS.forEach(key => {
        hash.update(
            hash.digest().toString('base64') + key
        )
    })
    return hash.digest().toString('base64')
}
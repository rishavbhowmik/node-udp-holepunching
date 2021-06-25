import { createSocket, RemoteInfo, Socket } from "dgram"
import { deserialize, serialize } from "v8"
import { ClientInfo } from "./DgramMapper"
import { Return } from "./util/Return"

type UdpServerCallbacks = {
    onError?: (err: Error) => void
    onMessage?: (msg: Message, rinfo: RemoteInfo) => void
}

export type Message = {
    messageUuid: string,
    type: 'ping' | 'myrinfo' | 'registerRinfo' | 'findRinfo' | 'dm',
    body: any
}

export class UdpServer {
    socket: Socket
    port: number
    host: string
    constructor(port: number, host: string) {
        this.socket = createSocket("udp4")
        this.port = port
        this.host = host
    }
    connect = () => {
        this.socket.connect(this.port, this.host)
    }
    bind = (callbacks: UdpServerCallbacks) => new Promise<Return<null>>((resolve) => {
        this.socket.bind(
            this.port, this.host,
            () => {
                resolve(new Return<null>(null, null))
            }
        )
        this.socket.on("error", (err) => {
            this.socket.disconnect()
            if (typeof callbacks.onError === 'function')
                callbacks.onError(err)
        })
        this.socket.on("message", (msg, rinfo) => {
            if (typeof callbacks.onMessage === 'function')
                callbacks.onMessage(
                    deserialize(msg) as Message, rinfo
                )
        })
    })
    respond = (rinfo: ClientInfo, message: Message) => new Promise<Return<number>>((resolve) => {
        this.socket.send(
            serialize(message),
            rinfo.port,
            rinfo.address,
            (error, bytes) => {
                if (error)
                    return resolve(new Return<number>(error, null))
                return resolve(new Return<number>(null, bytes))
            }
        )
    })
}
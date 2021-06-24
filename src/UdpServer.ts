import { createSocket, RemoteInfo, Socket } from "dgram"
import { deserialize, serialize } from "v8"
import { Return } from "./util/Return"

type UdpServerCallbacks = {
    onError?: (err: Error) => void
    onMessage?: (msg: Message, rinfo: RemoteInfo) => void
}

type Message = {
    messageUuid: string,
    type: 'ping' | 'myrinfo',
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
    bind = (callbacks: UdpServerCallbacks) => new Promise<Return>((resolve) => {
        this.socket.bind(
            this.port, this.host,
            () => {
                resolve([null, null])
            }
        )
        this.socket.on("error", (err) => {
            this.socket.disconnect()
            if (typeof callbacks.onError === 'function')
                callbacks.onError(err)
        })
        if (typeof callbacks.onMessage === 'function')
            this.socket.on("message", (msg, rinfo) => {
                callbacks.onMessage(
                    deserialize(msg) as Message, rinfo
                )
            })
    })
    respond = (rinfo: RemoteInfo, message: Message) => new Promise<Return>((resolve) => {
        this.socket.send(
            serialize(message),
            rinfo.port,
            rinfo.address,
            (error, bytes) => {
                if (error) return resolve([error, null])
                return resolve([null, bytes])
            }
        )
    })
}
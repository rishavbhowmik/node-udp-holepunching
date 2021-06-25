import { createSocket, RemoteInfo, Socket } from "dgram"
import { deserialize, serialize } from "v8"
import type { ClientInfo } from "./DgramMapper"
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
    bind(callbacks: UdpServerCallbacks) {
        const self = this
        return new Promise<Return<null>>((resolve) => {
            self.socket.on("error", (err) => {
                self.socket.disconnect()
                if (typeof callbacks.onError === 'function')
                    callbacks.onError(err)
            })
            self.socket.on("message", (msg, rinfo) => {
                if (typeof callbacks.onMessage === 'function')
                    callbacks.onMessage(
                        deserialize(msg) as Message, rinfo
                    )
            })
            self.socket.on('listening', () => {
                resolve(new Return<null>(null, null))
            })
            self.socket.bind(self.port, self.host)
        })
    }
    respond = (rinfo: ClientInfo, message: Message) => {
        const self = this
        return new Promise<Return<number>>((resolve) => {
            self.socket.send(
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
}

export class UdpClient {
    socket: Socket
    constructor(onMessage: (message: Message) => any) {
        this.socket = createSocket("udp4")
        this.socket.on("message", (msg) => {
            const message: Message = deserialize(msg)
            onMessage(message)
        })
        this.socket.on("error", (err) => {
            console.log({ err });
        })
    }
    send(rinfo: ClientInfo, message: Message) {
        this.socket.send(
            serialize(message),
            rinfo.port,
            rinfo.address
        )
    }
}
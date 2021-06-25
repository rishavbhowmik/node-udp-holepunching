import { Message, UdpServer } from "./udpServer"
import { DgramMapper } from "./DgramMapper"
import { RemoteInfo } from "dgram"
require('dotenv').config()

// const UDP_HOST = process.env.UDP_HOST
// const UDP_PORT = Number(process.env.UDP_PORT)

export default async (port: number, host: string) => {
    const udpServer = new UdpServer(port, host)
    const dgramMap = new DgramMapper()
    const onMessage = async (message: Message, rinfo: RemoteInfo) => {

        const { type, messageUuid } = message

        switch (type) {

            case 'ping':
                await udpServer.respond(
                    rinfo,
                    { type, messageUuid, body: "Pong" }
                ); break;

            case 'myrinfo':
                await udpServer.respond(
                    rinfo,
                    { type, messageUuid, body: rinfo }
                ); break;

            case 'registerRinfo': {
                const [error, result] = dgramMap.registerClient(rinfo).getAsTupple();
                if (error) break
                await udpServer.respond(
                    rinfo,
                    { type, messageUuid, body: result }
                ); break;
            }

            case 'findRinfo': {
                const [error, clientInfo] = dgramMap
                    .getClientInfo(message.body.clientId)
                    .getAsTupple()
                if (error) break
                await udpServer.respond(
                    rinfo,
                    { type, messageUuid, body: clientInfo }
                )
            }

            case 'dm': {
                const [error, clientInfo] = dgramMap
                    .getClientInfo(message.body.clientId)
                    .getAsTupple()
                if (error || !clientInfo) break
                await udpServer.respond(
                    clientInfo,
                    message
                )
            }
        }
    }
    const bindReturn = await udpServer.bind({
        onError: (err) => {
            console.error(err);
        },
        onMessage
    })

    const [bindError, bindResponse] = bindReturn.getAsTupple()
}
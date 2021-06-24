import { UdpServer } from "./udpServer"
import { DgramMapper } from "./DgramMapper"
require('dotenv').config()

const UDP_HOST = process.env.UDP_HOST
const UDP_PORT = Number(process.env.UDP_PORT)

export default async (port: number, host: string) => {
    const udpServer = new UdpServer(UDP_PORT, UDP_HOST)
    const dgramMap = new DgramMapper()
    const [bindError, bindResponse] = await udpServer.bind({
        onError: (err) => {
            console.error(err);
        },
        onMessage: async (message, rinfo) => {

            const { type, messageUuid } = message

            switch (type) {

                case 'ping': await udpServer.respond(
                    rinfo,
                    { type, messageUuid, body: "Pong" }
                ); break;

                case 'myrinfo': await udpServer.respond(
                    rinfo,
                    { type, messageUuid, body: rinfo }
                ); break;

            }
        }
    })
}
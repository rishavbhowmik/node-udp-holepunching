
import type { ClientInfo } from "../src/DgramMapper";
import makeTurnServer from "../src/makeTurnServer";
import { Message, UdpClient, UdpServer } from "../src/udpServer";
import { v4 as uuid } from "uuid"
import { createSocket } from "dgram";
import { serialize } from "v8";
require('dotenv').config()

const test = async () => {

    // start TURN server
    await makeTurnServer(65530, "127.0.0.1")
    // console.log("server made");

    // create clients
    const aliceCb: ((Message) => void)[] = []
    var aliceClientId = ""
    const alice = new UdpClient((message) => {
        console.log("Alice:", message);
        const cb = aliceCb.pop()
        if (cb) cb(message)
    })
    const bobCb: ((Message) => void)[] = []
    var bobClientId = ""
    const bob = new UdpClient((message) => {
        console.log("Bob:", message);
        const cb = bobCb.pop()
        if (cb) cb(message)
    })

    // print messages

    // server info for conneting it
    const serverInfo: ClientInfo = {
        port: 65530,
        address: "127.0.0.1"
    }

    // alice and bob ping the TURN server
    {
        console.log("alice and bob ping the TURN server");
        console.log("sending");
        setTimeout(() => {
            alice.send(serverInfo, {
                type: 'ping',
                messageUuid: uuid(),
                body: null
            })
        }, 1000)
        await new Promise((resolve) => {
            aliceCb.push((message) => {
                resolve(true)
            })
        })
        setTimeout(() => {
            bob.send(serverInfo, {
                type: 'ping',
                messageUuid: uuid(),
                body: null
            })
        }, 1000)
        await new Promise((resolve) => {
            bobCb.push((message) => {
                resolve(true)
            })
        })
    }
    {
        console.log("alice and bob register on the TURN server");
        console.log("sending");
        setTimeout(() => {
            alice.send(serverInfo, {
                type: 'registerRinfo',
                messageUuid: uuid(),
                body: null
            })
        }, 1000)
        await new Promise((resolve) => {
            aliceCb.push((message: Message) => {
                const { clientId } = message.body
                aliceClientId = clientId
                resolve(true)
            })
        })
        setTimeout(() => {
            bob.send(serverInfo, {
                type: 'registerRinfo',
                messageUuid: uuid(),
                body: null
            })
        }, 1000)
        await new Promise((resolve) => {
            bobCb.push((message) => {
                const { clientId } = message.body
                bobClientId = clientId
                resolve(true)
            })
        })
    }
    {
        console.log("alice DMs Bob and Bob DMs alice");
        console.log("sending");
        setTimeout(() => {
            alice.send(serverInfo, {
                type: 'dm',
                messageUuid: uuid(),
                body: {
                    clientId: bobClientId,
                    code: "Alice love it, yeah"
                }
            })
        }, 1000)
        await new Promise((resolve) => {
            bobCb.push((message) => {
                resolve(true)
            })
        })
        setTimeout(() => {
            bob.send(serverInfo, {
                type: 'dm',
                messageUuid: uuid(),
                body: {
                    clientId: aliceClientId,
                    code: "Bob likes it"
                }
            })
        }, 1000)
        await new Promise((resolve) => {
            aliceCb.push((message) => {
                resolve(true)
            })
        })
    }
}

test()
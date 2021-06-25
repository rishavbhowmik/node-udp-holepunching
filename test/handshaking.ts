
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

    //hole punching
    {
        console.log("HOLE PUNCHING");
        console.log("Alice and bob get each other's route info");

        var aliceGetsBob: ClientInfo | null = null
        setTimeout(() => {
            alice.send(serverInfo, {
                messageUuid: uuid(),
                type: 'findRinfo',
                body: {
                    clientId: bobClientId
                }
            })
        }, 1000)
        await new Promise((resolve) => {
            aliceCb.push((message: Message) => {
                aliceGetsBob = message.body
                console.log(
                    { aliceGetsBob }
                );
                resolve(true)
            })
        })
        var bobGetsAlice: ClientInfo | null = null
        setTimeout(() => {
            bob.send(serverInfo, {
                messageUuid: uuid(),
                type: 'findRinfo',
                body: {
                    clientId: aliceClientId
                }
            })
        }, 1000)
        await new Promise((resolve) => {
            bobCb.push((message: Message) => {
                bobGetsAlice = message.body
                console.log(
                    { bobGetsAlice }
                );
                resolve(true)
            })
        })
        await new Promise((resolve) => {
            bobCb.push((message: Message) => {
                bobGetsAlice = message.body
                console.log(
                    { bobGetsAlice }
                );
                resolve(true)
            })
        })

        console.log("Real P2P");
        setTimeout(() => {
            if (aliceGetsBob)
                alice.send(aliceGetsBob, {
                    messageUuid: uuid(),
                    type: 'findRinfo',
                    body: {
                        code: "Hi Bobby - Alice"
                    }
                })
        }, 1000)

        await Promise.all([
            new Promise((resolve) => {
                aliceCb.push((message: Message) => {
                    resolve(true)
                })
            }),
            await new Promise((resolve) => {
                bobCb.push((message: Message) => {
                    resolve(true)
                })
            })
        ])
        setTimeout(() => {
            console.log(2 ** 8, { bobGetsAlice });

            if (bobGetsAlice)
                bob.send(bobGetsAlice, {
                    messageUuid: uuid(),
                    type: 'findRinfo',
                    body: {
                        code: "Oh Hi, Aleeeeee! - Bob"
                    }
                })
        }, 1000)
        await Promise.all([
            new Promise((resolve) => {
                bobCb.push((message: Message) => {
                    resolve(true)
                })
            }),
            await new Promise((resolve) => {
                aliceCb.push((message: Message) => {
                    resolve(true)
                })
            })
        ])
    }
}

test()
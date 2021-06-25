import { v4 as uuid } from "uuid"
import { hashBuilder } from "./util/hashBuilder"
import { Return } from "./util/Return"

export type ClientUuid = string

export type ClientInfo = {
    address: string,
    port: number
}

/**
 * Collect, manage and share UDP connection info of UDP clients
 */
export class DgramMapper {

    private clientDgramMap = new Map<ClientUuid, ClientInfo>()

    /**
     * @param info Dgram info of new client
     */
    public registerClient(info: ClientInfo) {
        const clientId = uuid() as ClientUuid
        const clientIdHash = hashBuilder(clientId)
        this.clientDgramMap.set(clientId, info)
        return new Return<{ clientId: string, clientIdHash: string }>(
            null, { clientId, clientIdHash }
        )
    }

    /**
     * @param clientId unique id assigned to client
     * @param clientIdHash hash value sent by client
     * @param info new client's Dgram info
     */
    public updateClient(clientId: ClientUuid, clientIdHash: string, info: ClientInfo) {
        if (clientIdHash !== hashBuilder(clientId)) {
            const error = {
                code: 304, message: "Access denied"
            }
            return [error, null]
        }
        this.clientDgramMap.set(clientId, info)
        return new Return<null>(null, null)
    }

    /**
     * @param clientId unique id assigned to client
     * @returns 
     */
    public removeClient(clientId: ClientUuid) {
        const deleted = this.clientDgramMap.delete(clientId)
        if (deleted)
            return new Return<null>(null, null)
        const error = {
            code: 404, message: "Client not found"
        }
        return new Return<null>(error, null)
    }

    /**
     * @param clientId unique id assigned to client
     * @returns Return tupple with client in playload
     */
    public getClientInfo(clientId: ClientUuid) {
        const clientInfo = this.clientDgramMap.get(clientId)

        if (clientInfo) return new Return<ClientInfo>(null, clientInfo)

        const error = { code: 404, message: "ClientId not found" }
        return new Return<ClientInfo>(error, null)
    }

}
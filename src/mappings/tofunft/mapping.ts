import {
    EvInventoryUpdate as EvInventoryUpdateEvent,
    Tofunft as TofunftContract,
    Tofunft__inventoryTokensResult as InventoryTokensResult
} from "../entity/tofunft/tofunft/Tofunft";
import { Inventory } from "../entity/tofunft/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
// https://blockscout.com/astar/address/0x7Cae7FeB55349FeADB8f84468F692450D92597bc


export function handleInventoryUpdate(event: EvInventoryUpdateEvent): void {
    const id = event.params.id
    let inventory = Inventory.load(id.toString())
    if (inventory == null) {
        inventory = new Inventory(id.toString())
    }
    inventory.transactionHash = event.transaction.hash
    inventory.blockNumber = event.block.number
    inventory.blockTimestamp = event.block.timestamp
    inventory.seller = event.params.inventory.seller
    inventory.buyer = event.params.inventory.buyer
    inventory.currency = event.params.inventory.currency
    inventory.price = event.params.inventory.price
    inventory.netPrice = event.params.inventory.netPrice
    inventory.deadline = event.params.inventory.deadline
    inventory.kind = BigInt.fromI32(event.params.inventory.kind)
    inventory.status = BigInt.fromI32(event.params.inventory.status)

    const tofuContract = event.address
    const token = fetchInventoryToken(tofuContract, id)
    if (token != null) {
        inventory.token = token.getToken()
        inventory.tokenId = token.getTokenId()
        inventory.tokenAmount = token.getAmount()
        inventory.tokenKind = BigInt.fromI32(token.getKind())
    }

    inventory.save()
}

export function fetchInventoryToken(contractAddress: Address, inventoryId: BigInt): InventoryTokensResult | null {
    const contract = TofunftContract.bind(contractAddress)
    const token = contract.try_inventoryTokens(inventoryId, BigInt.fromString("0"));
    if (token.reverted) {
        return null
    }
    return token.value

}
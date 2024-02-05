import {
    OrderFulfilled as OrderFulfilledEvent,
} from "./entity/seaport/seaport/Seaport";
import { OrderFulfilled } from "./entity/seaport/schema";

// https://github.com/bluez-app/bluez-marketplace-protocol
export function handleOrderFulfilled(event: OrderFulfilledEvent): void {
    const id = event.params.orderHash;
    let orderFulfilled = OrderFulfilled.load(id)
    if (orderFulfilled != null) {
        return
    }
    orderFulfilled = new OrderFulfilled(id);
    const offerer = event.params.offerer;
    const zone = event.params.zone;
    const recipient = event.params.recipient;
    orderFulfilled.blockNumber = event.block.number;
    orderFulfilled.offerer = offerer;
    orderFulfilled.zone = zone;
    orderFulfilled.recipient = recipient;
    orderFulfilled.save();
}
import {
    IERC721,
    Transfer as TransferEvent,
} from "@openzeppelin/subgraphs/generated/erc721/IERC721";
import {fetchERC721Token} from "@openzeppelin/subgraphs/src/fetch/erc721";
import {fetchAccount} from "@openzeppelin/subgraphs/src/fetch/account";
import {Address, Bytes} from "@graphprotocol/graph-ts";
import {Account, ERC721Contract, ERC721Transfer} from "@openzeppelin/subgraphs/generated/schema";

import {
    events,
    transactions,
} from '@amxx/graphprotocol-utils'
import {supportsInterface} from "@openzeppelin/subgraphs/src/fetch/erc165";

const nonStandardAddress = [
    "0x7672f18994d876a319502f356efEA726c4354F39".toLowerCase(),
    "0x4872AfCF48b3d7dDE2B4c5E95c8395c5227B23Cb".toLowerCase(),
    "0xecd0311d2f48638217c43fc8baec03be922ad996".toLowerCase(),
    "0x43139550284a3e6ba07896d7317242156b8f745e".toLowerCase(),
    "0xa8e515f3e5d839db3b780b1be322e73fe575afcb".toLowerCase()
]
export function fetchERC721(address: Address): ERC721Contract | null {
    let erc721   = IERC721.bind(address)

    // Try load entry
    let contract = ERC721Contract.load(address)
    if (contract != null) {
        return contract
    }

    // Detect using ERC165
    let detectionId      = address.concat(Bytes.fromHexString('80ac58cd')) // Address + ERC721
    let detectionAccount = Account.load(detectionId)

    // On missing cache
    if (detectionAccount == null) {
        detectionAccount = new Account(detectionId)
        let introspection_01ffc9a7 = supportsInterface(erc721, '01ffc9a7') // ERC165
        let introspection_80ac58cd = supportsInterface(erc721, '80ac58cd') // ERC721
        let introspection_00000000 = supportsInterface(erc721, '00000000', false)
        let isERC721               = introspection_01ffc9a7 && introspection_80ac58cd && introspection_00000000
        detectionAccount.asERC721  = isERC721 ? address : null
        detectionAccount.save()
    }

    // If an ERC721, build entry
    if (detectionAccount.asERC721) {
        contract                  = new ERC721Contract(address)
        let try_name              = erc721.try_name()
        let try_symbol            = erc721.try_symbol()
        contract.name             = try_name.reverted   ? '' : try_name.value
        contract.symbol           = try_symbol.reverted ? '' : try_symbol.value
        contract.supportsMetadata = supportsInterface(erc721, '5b5e139f') // ERC721Metadata
        contract.asAccount        = address
        contract.save()

        let account               = fetchAccount(address)
        account.asERC721          = address
        account.save()
    } else if (nonStandardAddress.indexOf(address.toString().toLowerCase()) >= 0) {
        contract                  = new ERC721Contract(address)
        let try_name              = erc721.try_name()
        let try_symbol            = erc721.try_symbol()
        contract.name             = try_name.reverted   ? '' : try_name.value
        contract.symbol           = try_symbol.reverted ? '' : try_symbol.value
        contract.supportsMetadata = false
        contract.asAccount        = address
        contract.save()

        let account               = fetchAccount(address)
        account.asERC721          = address
        account.save()
    }

    return contract
}


export function handleTransfer(event: TransferEvent): void {
    let contract = fetchERC721(event.address)
    if (contract != null) {
        let token = fetchERC721Token(contract, event.params.tokenId)
        let from  = fetchAccount(event.params.from)
        let to    = fetchAccount(event.params.to)

        token.owner    = to.id
        token.approval = fetchAccount(Address.zero()).id // implicit approval reset on transfer

        contract.save()
        token.save()

        // @ts-ignore
        let ev         = new ERC721Transfer(events.id(event))
        ev.emitter     = contract.id
        // @ts-ignore
        ev.transaction = transactions.log(event).id
        ev.timestamp   = event.block.timestamp
        ev.contract    = contract.id
        ev.token       = token.id
        ev.from        = from.id
        ev.to          = to.id
        ev.save()
    }
}

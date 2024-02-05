# subgraphs-public

indexing ERC721/ERC1155 data from EVM

## Install

```shell
yarn
```

## Start Graph Node In Local

```shell
docker-compose up -d
```

## Build

```shell
# codegen
yarn codegen generated/erc721/zkatana.erc721.subgraph.yaml
# build
yarn build generated/erc721/zkatana.erc721.subgraph.yaml
```

## Deploying Subgraph To Local Graph Node

```shell
# create subgraph
yarn gcreate --node http://127.0.0.1:8020/ bluez/zkatana-erc721-v2

# deploy subgraph
yarn gdeploy --node http://127.0.0.1:8020/ --ipfs http://127.0.0.1:5001 bluez/zkatana-erc721-v2 generated/erc721/zkatana.erc721.subgraph.yaml
```

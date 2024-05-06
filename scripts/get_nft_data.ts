import { TonClient, TupleBuilder } from "@ton/ton";
import { Address } from "@ton/core";
import { getHttpEndpoint } from "@orbs-network/ton-access";

async function main() {
  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });

  const nftCollectionAddress = Address.parseFriendly("EQAv9X13hopdcDCO3azadyHy3mqIjzPgr0_fdrUdXjtpZjqP").address;
  
  const args = new TupleBuilder();
  args.writeNumber(2);
  args.build();

  const secondItemAddressData = await client.runMethod(nftCollectionAddress, "get_nft_address_by_index", args.build() );
  const secondItemAddressStack = secondItemAddressData.stack
  const secondItemAddress = secondItemAddressStack.readAddress()

  console.log("Second Item Address:", secondItemAddress);
  console.log("------------------")

  const secondItemData = await client.runMethod(secondItemAddress, "get_nft_data");
  const secondItemStack = secondItemData.stack

  const secondItemInitFlag = secondItemStack.readBigNumber();
  const secondItemIndex = secondItemStack.readBigNumber();
  const secondItemCollectionAddr = secondItemStack.readAddress();
  const secondItemOwnerAddr = secondItemStack.readAddress();

  console.log("Second Item Detailed Data:", );
  console.log(" - Init Flags:", secondItemInitFlag);
  console.log(" - Item Index:", secondItemIndex);
  console.log(" - Collection Address:", secondItemCollectionAddr);
  console.log(" - Owner Address:", secondItemOwnerAddr);

 
}
main().catch(error => {
  console.error('An error occurred:', error);
});
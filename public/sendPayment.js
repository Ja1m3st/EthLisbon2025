import { ethers } from "ethers";

export async function sendPayment(request, provider) {
  const signer = provider.getSigner();
  const usdrifContract = new ethers.Contract(USDRIF_ADDRESS, ERC20_ABI, signer);

  const tx = await usdrifContract.transfer(request.to, ethers.utils.parseUnits(request.amount.toString(), 18));
  return tx.wait();
}

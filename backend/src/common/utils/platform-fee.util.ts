export function calculatePlatformFee(rentalAmount: number): {
  feePercent: number;
  feeAmount: number;
} {
  let feePercent: number;
  if (rentalAmount <= 10000) {
    feePercent = 10;
  } else if (rentalAmount <= 50000) {
    feePercent = 7;
  } else {
    feePercent = 5;
  }
  const feeAmount = Math.round(rentalAmount * (feePercent / 100));
  return { feePercent, feeAmount };
}

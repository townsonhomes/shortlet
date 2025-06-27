// utils/dateUtils.js

export function isBookingOverlap(
  requestCheckIn,
  requestCheckOut,
  existingCheckIn,
  existingCheckOut
) {
  const toYMD = (date) => new Date(date).toISOString().split("T")[0];

  const reqIn = toYMD(requestCheckIn);
  const reqOut = toYMD(requestCheckOut);
  const exIn = toYMD(existingCheckIn);
  const exOut = toYMD(existingCheckOut);

  return reqIn < exOut && exIn < reqOut;
}

export const isExpiredToken = (expires_in: string) => {
  const dateOfExpire = new Date(+expires_in);
  const currentDate = new Date();
  return dateOfExpire < currentDate;
};


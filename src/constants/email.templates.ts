
const otpTemplate = (otp: string) => {
  return `
    <p>Hello!</p>
    <p>\Your verification code is: <strong>${otp}</strong></p>
    <p>Please enter this code to verify your email address. this code expires in 5 minutes.</p>
    <p>If you didn't request this verification, please ignore this email.</p>
  `
};


export {
  otpTemplate,
};




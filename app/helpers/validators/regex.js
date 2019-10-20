const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
const emailRegex = /^([\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-z0-9]{2,4})$/;
const mobileRegex = /^\d{4,15}$/;
const passwordRegex = /^(?=.*[A-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*_%$@])(?!.*[pPoO])\S{6,}$/;
const otpRegex = /^[\d]{6}$/;
const panNoRegex = /[A-Za-z]{5}\d{4}[A-Za-z]{1}/;
const gstNoRegex = /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9]){1}([a-zA-Z1-9]){1}([a-zA-Z0-9]){1}$/;
const accountNoRegex = /^([a-zA-Z0-9]){12,20}$/;
const ifscRegex = /^[A-Za-z]{4}0[A-Z0-9a-z]{6}$/;
const countryCodeRegex = /^\d{1,3}$/;
const timeRegex = /^([2][0-3]|[01]?[0-9])([.:][0-5][0-9])?$/;
const time24Regex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export default {
  urlRegex,
  emailRegex,
  mobileRegex,
  passwordRegex,
  otpRegex,
  panNoRegex,
  gstNoRegex,
  accountNoRegex,
  ifscRegex,
  countryCodeRegex,
  timeRegex,
  time24Regex,
  mongoIdRegex,
};

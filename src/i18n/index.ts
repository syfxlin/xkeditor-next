import en from "./en.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: en
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh_CN",
  keySeparator: false,
  interpolation: {
    escapeValue: false
  }
});

export default i18n;

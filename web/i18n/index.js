import en from "../i18n/en";
import ja from "../i18n/ja";
import { useRouter } from 'next/router'

export const useTranslation = () => {
    const { locale } = useRouter()
    return locale === "ja" ? ja : en;
}
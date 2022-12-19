import { useIntl } from "react-intl";

export default function SuraName({ index }) {
  const intl = useIntl();
  const suraNames = intl.formatMessage({ id: "sura_names" }).split(",");
  return suraNames?.[index];
}
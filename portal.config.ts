/**
 * This portal's configuration: the only file a fork needs to edit.
 * What each field means: src/config.ts. Generate one with `npm run setup`;
 * check it against the live API with `npm run check`.
 *
 * Iloilo Transparency, an unofficial civic transparency portal.
 * Its six DPWH district engineering offices bring in every DPWH line listed
 * under them; the place name brings in lines from all four programs whose
 * title names Iloilo (Central Office projects, farm-to-market roads, health
 * facilities, irrigation). A second place, Ilo-ilo, catches the same search
 * where the GAA spells the name with a hyphen: the match is a
 * case-insensitive substring, and the hyphen is part of it, so "Iloilo"
 * does not find "Ilo-ilo". The search is not limited to one region: some
 * Iloilo Central Office lines are tagged NCR. Namesakes are excluded by
 * hand, with reasons: three FY2027 lines, four nationwide PPP bundles that
 * name the Iloilo-Capiz-Aklan Expressway among projects elsewhere, and five
 * GAA projects in Barangay New Iloilo, Tantangan, South Cotabato, one of
 * them spelled New Ilo-ilo.
 *
 * DEO numbers differ from legislative districts: 1st district -> 1st DEO,
 * 2nd -> 4th DEO, 3rd -> 6th DEO, 4th -> 2nd DEO, 5th -> 3rd DEO, City lone
 * -> City DEO. No 5th DEO exists. The API maps the Iloilo 4th DEO only to
 * the 2nd District. The Iloilo 6th DEO, which now serves the 3rd District,
 * has no labelled amounts before 2025 (missing, not zero), so 2020–2024
 * office figures for the 3rd District cannot be attributed from this data.
 * That reading note is on the About page: this config has no field for it.
 */
import { defineConfig } from './src/config';

export default defineConfig({
  id: 'iloilo',
  kind: 'province',
  // Kind alone would say "Province". This copy covers the province and the city, and it is unofficial.
  kicker: 'Iloilo Province and Iloilo City · Independent, unofficial',
  name: 'Iloilo Transparency',
  shortName: 'Iloilo',
  operator: { name: 'Iloilo Transparency, an independent volunteer project' },
  siteUrl: 'https://iloilotransparency.info',
  scope: {
    offices: [
      'Iloilo City District Engineering Office',
      'Iloilo 1st District Engineering Office',
      'Iloilo 2nd District Engineering Office',
      'Iloilo 3rd District Engineering Office',
      'Iloilo 4th District Engineering Office',
      'Iloilo 6th District Engineering Office',
    ],
    places: [
      { label: 'Iloilo' },
      // Hyphenated spelling of the same name. See the note at the top.
      { label: 'Ilo-ilo' },
    ],
    districts: [
      'leg:iloilo-city:lone',
      'leg:iloilo:1st',
      'leg:iloilo:2nd',
      'leg:iloilo:3rd',
      'leg:iloilo:4th',
      'leg:iloilo:5th',
    ],
    exclude: [
      {
        key: 'dpwh:house-reading:16062',
        reason: 'A nationwide PPP bundle. The title names the Iloilo-Capiz-Aklan Expressway among many other projects, so this line is not specific to Iloilo.',
      },
      {
        key: 'dpwh:house-reading:15595',
        reason: 'Barangay New Iloilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
      {
        key: 'dpwh:house-reading:15705',
        reason: 'Barangay New Iloilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
      // Nationwide PPP bundles that name ICAX among projects elsewhere.
      {
        key: 'gaa:18-001|cavitelaguna cala expressway naia expressway nlexslex connector road tarlacpangasinanla union toll expressway tplex daang harislex link road prospective ppp projects central luzon link expressway cllex phase ii davao bypass davaodigos expressway project dingalancapasbotolan expressway project dpwh central office building iloilocapizaklan expressway icax kennon road project laguna lakeshore expressway dike metro cebu expressway mindorobatangas super bridge north luzon expressway east nlee phase i and ii opolnaawan expressway project pacific eastern seaboard expressway pangasinannueva ecija expressway panex plaridel bypass toll project quirino highway project villanuevacagayan de oroopol expressway',
        reason: 'A nationwide public-private partnership bundle. The published name lists the Iloilo-Capiz-Aklan Expressway (ICAX) among projects elsewhere, so this amount cannot be attributed to Iloilo.',
      },
      {
        key: 'gaa:18-001|regionwide  nationwide  roads and bridges  feasibility study including business case study for potential publicprivate partnership ppp projects  central luzon link expressway cllex phase ii north luzon east expressway nlee phase i and ii metro cebu expressway iloilocapizaklan expressway icax naawanopolcagayan de oro cityvillanueva expressway dingalancapasbotolan expressway project pangasinannueva ecija expressway panex cavitetagaytaybatangas expressway ctbex tarlacpangasinanla union expressway tplex extension project boracay bridge projects pacific eastern seaboard expressway mindorobatangas super bridge kennon road',
        reason: 'A nationwide feasibility study for public-private partnership projects. The published name lists the Iloilo-Capiz-Aklan Expressway (ICAX) among projects elsewhere, so this amount cannot be attributed to Iloilo.',
      },
      {
        key: 'gaa:18-001|tarlacpangasinanla union toll expressway tplex nlexslex connector road project cavitelaguna expressway calax project muntinlupacavite expressway daang harislex link road naia expressway quirino highway project dpwh central office building central luzon link expressway cllex phase ii north luzon expressway east nlee phase i and ii metro cebu expressway iloilocapizaklan expressway icax opolnaawan expressway project villanuevacagayan de oroopol expressway dingalancapasbotolan expressway project pangasinannueva ecija expressway panex cavitetagaytaybatangas expressway ctbex tarlacpangasinanla union expressway tplex extension project boracay bridge projects pacific eastern seaboard expressway mindorobatangas super bridge rehabilitationreconstructionimprovement operation  maintenance of kennon road project',
        reason: 'A nationwide public-private partnership bundle. The published name lists the Iloilo-Capiz-Aklan Expressway (ICAX) among projects elsewhere, so this amount cannot be attributed to Iloilo.',
      },
      {
        key: 'gaa:18-001|tarlacpangasinanla union expressway nlexslex connector road project cavitelaguna expressway project muntinlupacavite expressway daang harislex link road naia expressway quirino highway project dpwh central office building central luzon link expressway cllex phase ii ppp hybrid modality region iii north luzon expressway east nlee phase i and ii region iii metro cebu expressway region vii iloilocapizaklan expressway icax region vi naawanopolcagayan de orovillanueva expressway project region x dingalancapasbotolan expressway project region iii pangasinannueva ecija expressway panex region i  iii cavitetagaytaybatangas expressway ctbex region iva tarlacpangasinanla union expressway tplex extension project region i boracay bridge projects region vi pacific eastern seaboard expressway region iii  iva mindorobatangas super bridge region iva  ivb rehabilitation reconstruction improvement operation  maintenance of kennon road project car and such other priority publicprivate partnership infrastructure projects',
        reason: 'A nationwide public-private partnership bundle. The published name lists the Iloilo-Capiz-Aklan Expressway (ICAX) among projects elsewhere, so this amount cannot be attributed to Iloilo.',
      },
      // Barangay New Iloilo, Tantangan, South Cotabato.
      {
        key: 'gaa:18-001|construction of multipurpose building barangay new iloilo tantangan south cotabato',
        reason: 'Barangay New Iloilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
      {
        key: 'gaa:18-001|construction of solar water system barangay new iloilo tantangan south cotabato',
        reason: 'Barangay New Iloilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
      {
        key: 'gaa:18-001|construction of riverbank protection along blok creek brgy new iloilo tantangan south cotabato',
        reason: 'Barangay New Iloilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
      {
        key: 'gaa:18-001|construction of one 1 storey  two 2 classroom school building new iloilo elementary school 130879 barangay new iloilo tantangan south cotabato',
        reason: 'Barangay New Iloilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
      {
        key: 'gaa:18-001|construction of new iloilo bridge along midsayapmarbel rd barangay new iloilo tantangan south cotabato',
        reason: 'Barangay New Ilo-ilo, Tantangan, South Cotabato, not Iloilo Province or Iloilo City.',
      },
    ],
  },
  reporting: { enabled: false },
});

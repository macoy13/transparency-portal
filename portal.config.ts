/**
 * This portal's configuration: the only file a fork needs to edit.
 * What each field means: src/config.ts. Generate one with `npm run setup`;
 * check it against the live API with `npm run check`.
 *
 * Iloilo Transparency, an unofficial civic transparency portal.
 * Its six DPWH district engineering offices bring in every DPWH line listed
 * under them; the place name brings in lines from all four programs whose
 * title names Iloilo (Central Office projects, farm-to-market roads, health
 * facilities, irrigation), kept to region VI.
 *
 * DEO numbers differ from legislative districts: 1st district -> 1st DEO,
 * 2nd -> 4th DEO, 3rd -> 6th DEO, 4th -> 2nd DEO, 5th -> 3rd DEO, City lone
 * -> City DEO. No 5th DEO exists. The 6th DEO has no GAA labels before 2025.
 */
import { defineConfig } from './src/config';

export default defineConfig({
  id: 'iloilo',
  kind: 'province',
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
    places: [{ label: 'Iloilo', region: 'VI' }],
    districts: [
      'leg:iloilo-city:lone',
      'leg:iloilo:1st',
      'leg:iloilo:2nd',
      'leg:iloilo:3rd',
      'leg:iloilo:4th',
      'leg:iloilo:5th',
    ],
    exclude: [],
  },
  reporting: { enabled: false },
});

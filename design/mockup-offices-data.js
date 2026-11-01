/**
 * Sample office + filter data for R0 mockups. Record arithmetic:
 * six offices × 60 = 360 (330 both + 20 house-only + 10 nep-only).
 * Per office: 55 both + 3 house-only + 2 nep-only = 60;
 * both split: 31 same + 16 higher + 8 lower = 55.
 */
(function (global) {
  const REPS = {
    lone: {
      name: 'Baronda, Julienne "Jam" L.',
      portrait: 'portraits/baronda.jpg',
      honorific: 'District Representative',
      leadership: 'Deputy majority leader',
      profile: 'https://www.congress.gov.ph/house-members/view/J013',
      bills: 'https://bills.juris.ph/authors/house?author=BARONDA%2C+JULIENNE+%22JAM%22+L.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo-city:lone',
      districtLabel: 'Iloilo City, Lone District',
    },
    '1st': {
      name: 'Garin, Janette L.',
      portrait: 'portraits/garin.jpg',
      honorific: 'District Representative',
      leadership: 'Deputy Speaker',
      profile: 'https://www.congress.gov.ph/house-members/view/E032',
      bills: 'https://bills.juris.ph/authors/house?author=GARIN%2C+JANETTE+L.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:1st',
      districtLabel: 'Iloilo, 1st District',
    },
    '2nd': {
      name: 'Gorriceta, Kathryn Joyce F., MD',
      portrait: 'portraits/gorriceta.jpg',
      honorific: 'District Representative',
      leadership: null,
      profile: 'https://www.congress.gov.ph/house-members/view/L042',
      bills: 'https://bills.juris.ph/authors/house?author=GORRICETA%2C+KATHRYN+JOYCE+F.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:2nd',
      districtLabel: 'Iloilo, 2nd District',
    },
    '3rd': {
      name: 'Defensor, Lorenz R.',
      portrait: 'portraits/defensor.jpg',
      honorific: 'District Representative',
      leadership: null,
      profile: 'https://www.congress.gov.ph/house-members/view/J119',
      bills: 'https://bills.juris.ph/authors/house?author=DEFENSOR%2C+LORENZ+R.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:3rd',
      districtLabel: 'Iloilo, 3rd District',
    },
    '4th': {
      name: 'Biron, Ferjenel G., M.D.',
      portrait: 'portraits/biron.jpg',
      honorific: 'District Representative',
      leadership: 'Deputy Speaker',
      profile: 'https://www.congress.gov.ph/house-members/view/E018',
      bills: 'https://bills.juris.ph/authors/house?author=BIRON%2C+FERJENEL+G.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:4th',
      districtLabel: 'Iloilo, 4th District',
    },
    '5th': {
      name: 'Tupas, Binky April M.',
      portrait: 'portraits/tupas.jpg',
      honorific: 'District Representative',
      leadership: null,
      profile: 'https://www.congress.gov.ph/house-members/view/L084',
      bills: 'https://bills.juris.ph/authors/house?author=TUPAS%2C+BINKY+APRIL+M.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:5th',
      districtLabel: 'Iloilo, 5th District',
    },
  };

  const OFFICE_META = [
    {
      id: 'office:iloilo-city-deo',
      printed: 'Iloilo City District Engineering Office',
      kind: 'District Engineering Office',
      region: 'Region VI',
      tier: 'A',
      tierText: 'Tier A · one district',
      districtKey: 'lone',
      gaaHash: 'office:iloilo-city-deo',
      amounts: { nep: '₱3.6B', house: '₱3.9B', change: '+₱0.3B', nepRecords: 58, houseRecords: 59, wholeNep: '₱4.1B', unconfirmed: 2, unconfirmedPhp: '₱12M' },
    },
    {
      id: 'office:iloilo-1st-deo',
      printed: 'Iloilo 1st District Engineering Office',
      kind: 'District Engineering Office',
      region: 'Region VI',
      tier: 'A',
      tierText: 'Tier A · one district',
      districtKey: '1st',
      gaaHash: 'office:iloilo-1st-deo',
      amounts: { nep: '₱2.8B', house: '₱3.0B', change: '+₱0.2B', nepRecords: 57, houseRecords: 58, wholeNep: '₱3.2B', unconfirmed: 1, unconfirmedPhp: '₱4M' },
    },
    {
      id: 'office:iloilo-2nd-deo',
      printed: 'Iloilo 2nd District Engineering Office',
      kind: 'District Engineering Office',
      region: 'Region VI',
      tier: 'A',
      tierText: 'Tier A · one district',
      districtKey: '4th',
      gaaHash: 'office:iloilo-2nd-deo',
      amounts: { nep: '₱2.7B', house: '₱2.9B', change: '+₱0.2B', nepRecords: 56, houseRecords: 57, wholeNep: '₱3.0B', unconfirmed: 0, unconfirmedPhp: null },
    },
    {
      id: 'office:iloilo-3rd-deo',
      printed: 'Iloilo 3rd District Engineering Office',
      kind: 'District Engineering Office',
      region: 'Region VI',
      tier: 'A',
      tierText: 'Tier A · one district',
      districtKey: '5th',
      gaaHash: 'office:iloilo-3rd-deo',
      amounts: { nep: '₱2.5B', house: '₱2.6B', change: '+₱0.1B', nepRecords: 55, houseRecords: 56, wholeNep: '₱2.9B', unconfirmed: 1, unconfirmedPhp: '₱2M' },
    },
    {
      id: 'office:iloilo-4th-deo',
      printed: 'Iloilo 4th District Engineering Office',
      kind: 'District Engineering Office',
      region: 'Region VI',
      tier: 'A',
      tierText: 'Tier A · one district',
      districtKey: '2nd',
      gaaHash: 'office:iloilo-4th-deo',
      amounts: { nep: '₱2.4B', house: '₱2.5B', change: '+₱0.1B', nepRecords: 54, houseRecords: 55, wholeNep: '₱2.7B', unconfirmed: 0, unconfirmedPhp: null },
    },
    {
      id: 'office:iloilo-6th-deo',
      printed: 'Iloilo 6th District Engineering Office',
      kind: 'District Engineering Office',
      region: 'Region VI',
      tier: 'A',
      tierText: 'Tier A · one district',
      districtKey: '3rd',
      gaaHash: 'office:iloilo-6th-deo',
      amounts: { nep: '₱2.0B', house: '₱2.1B', change: '+₱0.1B', nepRecords: 53, houseRecords: 54, wholeNep: '₱2.3B', unconfirmed: 2, unconfirmedPhp: '₱6M' },
    },
  ];

  function officeRow(meta, groups, lines) {
    const a = meta.amounts;
    return {
      ...meta,
      lines,
      nep: a.nep,
      house: a.house,
      change: a.change,
      groups,
      note: {
        nepRecords: a.nepRecords,
        houseRecords: a.houseRecords,
        wholeNep: a.wholeNep,
        unconfirmed: a.unconfirmed,
        unconfirmedPhp: a.unconfirmedPhp,
        held: 0,
      },
      rep: REPS[meta.districtKey],
    };
  }

  const bothSplit = { unchanged: 31, increased: 16, decreased: 8 };
  const houseNepSplit = [
    { house_only: 4, nep_only: 2 },
    { house_only: 4, nep_only: 2 },
    { house_only: 3, nep_only: 2 },
    { house_only: 3, nep_only: 2 },
    { house_only: 3, nep_only: 1 },
    { house_only: 3, nep_only: 1 },
  ];

  const scopes = {
    '': {
      filterLabel: 'All project records (six offices)',
      activeChip: '',
      chips: { unchanged: 186, increased: 96, decreased: 48, house_only: 20, nep_only: 10 },
      summary: {
        records: 360,
        nep: '₱16.0B',
        house: '₱17.0B',
        nepOn: 340,
        houseOn: 350,
        note: 'Six offices · 60 per office · compared, not added',
      },
      scopeNote:
        'Sample summary for the six offices (table below) — 360 records (330 with both lines, 20 House-only, 10 NEP-only); compared, not added.',
      offices: OFFICE_META.map((m, i) =>
        officeRow(m, { ...bothSplit, ...houseNepSplit[i] }, 60),
      ),
    },
    increased: {
      filterLabel: 'Increased in House',
      activeChip: 'increased',
      chips: { unchanged: 0, increased: 80, decreased: 0, house_only: 0, nep_only: 0 },
      summary: {
        records: 80,
        nep: '₱12.4B',
        house: '₱13.6B',
        nepOn: 80,
        houseOn: 80,
        note: 'Higher in the House bill · six offices',
      },
      scopeNote: 'Filtered sample — 80 records with higher House amounts (16 per office in this mock).',
      offices: OFFICE_META.map((m, i) => {
        const inc = i < 2 ? 14 : 13;
        return officeRow(
          m,
          { house_only: 0, nep_only: 0, unchanged: 0, increased: inc, decreased: 0 },
          inc,
        );
      }),
    },
  };

  global.MOCKUP_OFFICE_DATA = {
    chipLabels: {
      house_only: 'House only',
      nep_only: 'NEP only',
      unchanged: 'same amount',
      increased: 'higher in House',
      decreased: 'lower in House',
    },
    chipOrder: ['unchanged', 'increased', 'decreased', 'house_only', 'nep_only'],
    scopes,
  };
})(typeof window !== 'undefined' ? window : globalThis);

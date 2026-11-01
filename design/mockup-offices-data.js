/**
 * Sample office + filter data for R0 mockups. Record arithmetic:
 * six offices × 60 = 360 (330 both + 20 House-only + 10 NEP-only).
 * House-only 4/4/3/3/3/3; NEP-only 2/2/2/2/1/1; both 54/54/55/55/56/56.
 * Both split per card: same + higher + lower (higher 16 each = 96).
 */
(function (global) {
  const REPS = {
    lone: {
      name: 'Baronda, Julienne "Jam" L.',
      portrait: 'portraits/baronda.jpg',
      honorific: 'District Representative',
      profile: 'https://www.congress.gov.ph/house-members/view/J013',
      bills: 'https://bills.juris.ph/authors/house?author=BARONDA%2C+JULIENNE+%22Jam%22+L.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo-city:lone',
      districtLabel: 'Iloilo City, Lone District',
      portraitSource: 'https://commons.wikimedia.org/wiki/File:Rep._Julienne_Baronda_(20th_Congress).jpg',
    },
    '1st': {
      name: 'Garin, Janette L.',
      portrait: 'portraits/garin.jpg',
      honorific: 'District Representative',
      profile: 'https://www.congress.gov.ph/house-members/view/E032',
      bills: 'https://bills.juris.ph/authors/house?author=GARIN%2C+JANETTE+L.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:1st',
      districtLabel: 'Iloilo, 1st District',
      portraitSource: 'https://commons.wikimedia.org/wiki/File:Rep._Janette_Garin_(20th_Congress).jpg',
    },
    '2nd': {
      name: 'Gorriceta, Kathryn Joyce F., MD',
      portrait: 'portraits/gorriceta.jpg',
      honorific: 'District Representative',
      profile: 'https://www.congress.gov.ph/house-members/view/L042',
      bills: 'https://bills.juris.ph/authors/house?author=GORRICETA%2C+KATHRYN+JOYCE+F.+MD',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:2nd',
      districtLabel: 'Iloilo, 2nd District',
      portraitSource: 'https://commons.wikimedia.org/wiki/File:Rep._Kathryn_Joyce_Gorriceta_(20th_Congress).jpg',
    },
    '3rd': {
      name: 'Defensor, Lorenz R.',
      portrait: 'portraits/defensor.jpg',
      honorific: 'District Representative',
      profile: 'https://www.congress.gov.ph/house-members/view/J119',
      bills: 'https://bills.juris.ph/authors/house?author=DEFENSOR%2C+LORENZ+R.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:3rd',
      districtLabel: 'Iloilo, 3rd District',
      portraitSource: 'https://commons.wikimedia.org/wiki/File:Rep._Lorenz_Defensor_(20th_Congress).jpg',
    },
    '4th': {
      name: 'Biron, Ferjenel G., M.D.',
      portrait: 'portraits/biron.jpg',
      honorific: 'District Representative',
      profile: 'https://www.congress.gov.ph/house-members/view/E018',
      bills: 'https://bills.juris.ph/authors/house?author=BIRON%2C+FERJENEL+G.%2CMD.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:4th',
      districtLabel: 'Iloilo, 4th District',
      portraitSource: 'https://commons.wikimedia.org/wiki/File:Rep._Ferjenel_Biron_(20th_Congress).jpg',
    },
    '5th': {
      name: 'Tupas, Binky April M.',
      portrait: 'portraits/tupas.jpg',
      honorific: 'District Representative',
      profile: 'https://www.congress.gov.ph/house-members/view/L084',
      bills: 'https://bills.juris.ph/authors/house?author=TUPAS%2C+BINKY+APRIL+M.',
      districtPage: 'https://budget.bettergov.ph/d/leg:iloilo:5th',
      districtLabel: 'Iloilo, 5th District',
      portraitSource: 'https://commons.wikimedia.org/wiki/File:Rep._Binky_April_Tupas_(20th_Congress).jpg',
    },
  };

  /** Amounts in billions (numeric) for bar scale; labels for display. */
  const OFFICE_META = [
    {
      id: 'office:iloilo-city-deo',
      printed: 'Iloilo City District Engineering Office',
      short: 'Iloilo City DEO',
      region: 'Region VI',
      districtKey: 'lone',
      gaaHash: 'office:iloilo-city-deo',
      groups: { house_only: 4, nep_only: 2, unchanged: 30, increased: 16, decreased: 8 },
      full: { nepB: 3.6, houseB: 3.9, change: '+₱0.3B', changePct: '+8.3%', wholeNep: '₱4.1B', unconfirmed: 2 },
      increased: { nepB: 2.4, houseB: 2.7, change: '+₱0.3B', changePct: '+12.5%' },
    },
    {
      id: 'office:iloilo-1st-deo',
      printed: 'Iloilo 1st District Engineering Office',
      short: 'Iloilo 1st DEO',
      region: 'Region VI',
      districtKey: '1st',
      gaaHash: 'office:iloilo-1st-deo',
      groups: { house_only: 4, nep_only: 2, unchanged: 30, increased: 16, decreased: 8 },
      full: { nepB: 2.8, houseB: 3.0, change: '+₱0.2B', changePct: '+7.1%', wholeNep: '₱3.2B', unconfirmed: 1 },
      increased: { nepB: 1.9, houseB: 2.1, change: '+₱0.2B', changePct: '+10.5%' },
    },
    {
      id: 'office:iloilo-2nd-deo',
      printed: 'Iloilo 2nd District Engineering Office',
      short: 'Iloilo 2nd DEO',
      region: 'Region VI',
      districtKey: '4th',
      gaaHash: 'office:iloilo-2nd-deo',
      groups: { house_only: 3, nep_only: 2, unchanged: 31, increased: 16, decreased: 8 },
      full: { nepB: 2.7, houseB: 2.9, change: '+₱0.2B', changePct: '+7.4%', wholeNep: '₱3.0B', unconfirmed: 0 },
      increased: { nepB: 1.8, houseB: 2.0, change: '+₱0.2B', changePct: '+11.1%' },
    },
    {
      id: 'office:iloilo-3rd-deo',
      printed: 'Iloilo 3rd District Engineering Office',
      short: 'Iloilo 3rd DEO',
      region: 'Region VI',
      districtKey: '5th',
      gaaHash: 'office:iloilo-3rd-deo',
      groups: { house_only: 3, nep_only: 2, unchanged: 31, increased: 16, decreased: 8 },
      full: { nepB: 2.5, houseB: 2.6, change: '+₱0.1B', changePct: '+4.0%', wholeNep: '₱2.9B', unconfirmed: 1 },
      increased: { nepB: 1.6, houseB: 1.7, change: '+₱0.1B', changePct: '+6.3%' },
    },
    {
      id: 'office:iloilo-4th-deo',
      printed: 'Iloilo 4th District Engineering Office',
      short: 'Iloilo 4th DEO',
      region: 'Region VI',
      districtKey: '2nd',
      gaaHash: 'office:iloilo-4th-deo',
      groups: { house_only: 3, nep_only: 1, unchanged: 32, increased: 16, decreased: 8 },
      full: { nepB: 2.4, houseB: 2.5, change: '+₱0.1B', changePct: '+4.2%', wholeNep: '₱2.7B', unconfirmed: 0 },
      increased: { nepB: 1.5, houseB: 1.6, change: '+₱0.1B', changePct: '+6.7%' },
    },
    {
      id: 'office:iloilo-6th-deo',
      printed: 'Iloilo 6th District Engineering Office',
      short: 'Iloilo 6th DEO',
      region: 'Region VI',
      districtKey: '3rd',
      gaaHash: 'office:iloilo-6th-deo',
      groups: { house_only: 3, nep_only: 1, unchanged: 32, increased: 16, decreased: 8 },
      full: { nepB: 2.0, houseB: 2.1, change: '+₱0.1B', changePct: '+5.0%', wholeNep: '₱2.3B', unconfirmed: 2 },
      increased: { nepB: 1.2, houseB: 1.3, change: '+₱0.1B', changePct: '+8.3%' },
    },
  ];

  function phpB(n) {
    return '₱' + n.toFixed(1) + 'B';
  }

  function officeRow(meta, amounts, groups, scaleMaxB) {
    const both = groups.unchanged + groups.increased + groups.decreased;
    const lines = both + groups.house_only + groups.nep_only;
    return {
      id: meta.id,
      printed: meta.printed,
      short: meta.short,
      region: meta.region,
      gaaHash: meta.gaaHash,
      lines,
      nep: phpB(amounts.nepB),
      house: phpB(amounts.houseB),
      nepB: amounts.nepB,
      houseB: amounts.houseB,
      scaleMaxB,
      nepPct: (amounts.nepB / scaleMaxB) * 100,
      housePct: (amounts.houseB / scaleMaxB) * 100,
      change: amounts.change,
      changePct: amounts.changePct,
      changeLabel: amounts.change + ' (' + amounts.changePct + ')',
      groups,
      note: {
        nepRecords: both + groups.nep_only,
        houseRecords: both + groups.house_only,
        wholeNep: amounts.wholeNep ?? null,
        unconfirmed: amounts.unconfirmed ?? 0,
      },
      rep: REPS[meta.districtKey],
    };
  }

  const CHIP_COUNTS = { all: 360, unchanged: 186, increased: 96, decreased: 48, house_only: 20, nep_only: 10 };
  /** Table chips: office counts (every DEO has each bridge group in the full sample). */
  const TABLE_CHIP_COUNTS = { all: 6, unchanged: 6, increased: 6, decreased: 6, house_only: 6, nep_only: 6 };

  const scopes = {
    all: {
      filterLabel: 'All',
      activeChip: 'all',
      chips: CHIP_COUNTS,
      tableChips: TABLE_CHIP_COUNTS,
      scaleMaxB: 3.9,
      summary: {
        records: 360,
        nep: '₱16.0B',
        house: '₱17.0B',
        recordsNote: 'Six offices · 60 per office (sample)',
        nepNote: 'NEP on 340 records (sample)',
        houseNote: 'House on 350 records (sample)',
      },
      showFullNotes: true,
      offices: OFFICE_META.map((m) => officeRow(m, m.full, { ...m.groups }, 3.9)),
    },
    increased: {
      filterLabel: 'Higher in House',
      activeChip: 'increased',
      chips: CHIP_COUNTS,
      tableChips: { all: 6, unchanged: 0, increased: 6, decreased: 0, house_only: 0, nep_only: 0 },
      scaleMaxB: 2.7,
      summary: {
        records: 96,
        nep: '₱10.4B',
        house: '₱11.4B',
        recordsNote: '16 per office · Higher in House (sample)',
        nepNote: null,
        houseNote: null,
      },
      showFullNotes: false,
      offices: OFFICE_META.map((m) =>
        officeRow(
          m,
          { ...m.increased, wholeNep: null, unconfirmed: 0 },
          { house_only: 0, nep_only: 0, unchanged: 0, increased: 16, decreased: 0 },
          2.7,
        ),
      ),
    },
  };

  global.MOCKUP_OFFICE_DATA = {
    chipLabels: {
      all: 'All',
      unchanged: 'Same amount',
      increased: 'Higher in House',
      decreased: 'Lower in House',
      house_only: 'House only',
      nep_only: 'NEP only',
    },
    chipOrder: ['all', 'unchanged', 'increased', 'decreased', 'house_only', 'nep_only'],
    wiredChips: ['all', 'increased'],
    scopes,
  };
})(typeof window !== 'undefined' ? window : globalThis);

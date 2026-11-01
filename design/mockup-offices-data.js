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
      full: {
        nep: '₱3.6B',
        house: '₱3.9B',
        change: '+₱0.3B',
        wholeNep: '₱4.1B',
        unconfirmed: 2,
        unconfirmedPhp: '₱12M',
      },
      groups: { house_only: 4, nep_only: 2, unchanged: 30, increased: 16, decreased: 8 },
      increased: { nep: '₱2.4B', house: '₱2.7B', change: '+₱0.3B' },
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
      full: {
        nep: '₱2.8B',
        house: '₱3.0B',
        change: '+₱0.2B',
        wholeNep: '₱3.2B',
        unconfirmed: 1,
        unconfirmedPhp: '₱4M',
      },
      groups: { house_only: 4, nep_only: 2, unchanged: 30, increased: 16, decreased: 8 },
      increased: { nep: '₱1.9B', house: '₱2.1B', change: '+₱0.2B' },
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
      full: {
        nep: '₱2.7B',
        house: '₱2.9B',
        change: '+₱0.2B',
        wholeNep: '₱3.0B',
        unconfirmed: 0,
        unconfirmedPhp: null,
      },
      groups: { house_only: 3, nep_only: 2, unchanged: 31, increased: 16, decreased: 8 },
      increased: { nep: '₱1.8B', house: '₱2.0B', change: '+₱0.2B' },
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
      full: {
        nep: '₱2.5B',
        house: '₱2.6B',
        change: '+₱0.1B',
        wholeNep: '₱2.9B',
        unconfirmed: 1,
        unconfirmedPhp: '₱2M',
      },
      groups: { house_only: 3, nep_only: 2, unchanged: 31, increased: 16, decreased: 8 },
      increased: { nep: '₱1.6B', house: '₱1.7B', change: '+₱0.1B' },
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
      full: {
        nep: '₱2.4B',
        house: '₱2.5B',
        change: '+₱0.1B',
        wholeNep: '₱2.7B',
        unconfirmed: 0,
        unconfirmedPhp: null,
      },
      groups: { house_only: 3, nep_only: 1, unchanged: 32, increased: 16, decreased: 8 },
      increased: { nep: '₱1.5B', house: '₱1.6B', change: '+₱0.1B' },
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
      full: {
        nep: '₱2.0B',
        house: '₱2.1B',
        change: '+₱0.1B',
        wholeNep: '₱2.3B',
        unconfirmed: 2,
        unconfirmedPhp: '₱6M',
      },
      groups: { house_only: 3, nep_only: 1, unchanged: 32, increased: 16, decreased: 8 },
      increased: { nep: '₱1.2B', house: '₱1.3B', change: '+₱0.1B' },
    },
  ];

  function officeRow(meta, { groups, amounts, note }) {
    return {
      id: meta.id,
      printed: meta.printed,
      kind: meta.kind,
      region: meta.region,
      tier: meta.tier,
      tierText: meta.tierText,
      gaaHash: meta.gaaHash,
      lines: groups.house_only + groups.nep_only + groups.unchanged + groups.increased + groups.decreased,
      nep: amounts.nep,
      house: amounts.house,
      change: amounts.change,
      groups,
      note,
      rep: REPS[meta.districtKey],
    };
  }

  const fullChipCounts = { unchanged: 186, increased: 96, decreased: 48, house_only: 20, nep_only: 10 };

  const scopes = {
    '': {
      filterLabel: 'All project records (six offices)',
      activeChip: '',
      chips: fullChipCounts,
      summary: {
        records: 360,
        nep: '₱16.0B',
        house: '₱17.0B',
        note: 'Six offices · 60 per office · compared, not added',
        nepHouseNote: 'NEP on 340 records · House on 350 records · compared, not added',
      },
      scopeNote:
        'Sample summary for the six offices (table below) — 360 records (330 with both lines, 20 House-only, 10 NEP-only); compared, not added.',
      showFullNotes: true,
      offices: OFFICE_META.map((m) => {
        const g = m.groups;
        const both = g.unchanged + g.increased + g.decreased;
        return officeRow(m, {
          groups: { ...g },
          amounts: { nep: m.full.nep, house: m.full.house, change: m.full.change },
          note: {
            nepRecords: both + g.nep_only,
            houseRecords: both + g.house_only,
            wholeNep: m.full.wholeNep,
            unconfirmed: m.full.unconfirmed,
            unconfirmedPhp: m.full.unconfirmedPhp,
            held: 0,
          },
        });
      }),
    },
    increased: {
      filterLabel: 'Increased in House',
      activeChip: 'increased',
      chips: { unchanged: 186, increased: 96, decreased: 48, house_only: 20, nep_only: 10 },
      summary: {
        records: 96,
        nep: '₱10.4B',
        house: '₱11.4B',
        note: '16 higher-in-House records per office · compared, not added',
        nepHouseNote: null,
      },
      scopeNote: 'Filtered sample — 96 records with higher House amounts (16 per office). Whole-office and unconfirmed notes hidden while a filter is active.',
      showFullNotes: false,
      offices: OFFICE_META.map((m) =>
        officeRow(m, {
          groups: { house_only: 0, nep_only: 0, unchanged: 0, increased: 16, decreased: 0 },
          amounts: { nep: m.increased.nep, house: m.increased.house, change: m.increased.change },
          note: {
            nepRecords: 16,
            houseRecords: 16,
            wholeNep: null,
            unconfirmed: 0,
            unconfirmedPhp: null,
            held: 0,
          },
        }),
      ),
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
    wiredChips: ['increased'],
    chipOrder: ['unchanged', 'increased', 'decreased', 'house_only', 'nep_only'],
    scopes,
  };
})(typeof window !== 'undefined' ? window : globalThis);

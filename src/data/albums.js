// Real album + photo data, with measured aspect ratios (ratio = native w/h).
// Order matters — it defines the prev/next album ordering (SPEC §9).
// Photo `src` paths are absolute (served from /public/uploads) so they
// resolve correctly under nested routes like /travels/italy-2020.
//
// Critical: every photo carries a measured `ratio`. Re-measure if you swap
// a source file — without correct ratios the justified-strips layout breaks.
export const ALBUMS = [
  {
    id: "philippines-2026",
    title: "Philippines",
    when: "April 2026",
    places: "Negros · Visayas",
    cover: "/uploads/75EDB0D8-A011-4FA2-96CC-8A415281C4A6_1_102_o.jpeg",
    statement:
      "Home. The light inside an old church, the company of monuments in an afternoon park. Memories returned to.",
    photos: [
      { src: "/uploads/75EDB0D8-A011-4FA2-96CC-8A415281C4A6_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/855DD7D3-5CBB-4ACA-8CB3-D2E1EB2AA87C_1_102_o.jpeg", ratio: 0.6667 },
    ],
  },
  {
    id: "australia-2026",
    title: "Australia",
    when: "March 2026",
    places: "Sydney · New South Wales",
    cover: "/uploads/994C8E04-98D1-4724-BF7F-0FCC0101F2FC_1_105_c.jpeg",
    statement:
      "A summer harbour at the far edge of the year. Concrete vaulting where the bridge meets the shore; a city skyline soft across the bay.",
    photos: [
      { src: "/uploads/994C8E04-98D1-4724-BF7F-0FCC0101F2FC_1_105_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/63F7AFC7-7EC2-4FAD-AEE3-73B968DB4AC9_4_5005_c.jpeg", ratio: 0.6667 },
    ],
  },
  {
    id: "northern-europe-2022",
    title: "Northern Europe",
    when: "October 2022",
    places: "Köln · Amsterdam · Vaduz",
    cover: "/uploads/99208908-8DC6-4227-B80D-6D73BC2C3EBD_1_102_o.jpeg",
    statement:
      "A wandering year. Cathedrals lit gold against a black sky; canals quiet at dusk; a small castle at the foot of a green range.",
    photos: [
      { src: "/uploads/99208908-8DC6-4227-B80D-6D73BC2C3EBD_1_102_o.jpeg", ratio: 1.5 },
      { src: "/uploads/FEE819CC-BE47-4CF8-82D1-0B91421C759F_4_5005_c.jpeg", ratio: 1.5 },
      { src: "/uploads/F29C6103-EB41-415A-8D9E-5786CDE97392_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/2E776DD9-5337-4648-A636-6A375811645C_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/287A5096-978C-4921-8078-FC3ADE0D4C06_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/ams-1.jpeg", ratio: 0.6485 },
      { src: "/uploads/ams-2.jpeg", ratio: 0.5893 },
      { src: "/uploads/3BE745B1-0C6F-4534-944C-8DD19F4AA60B_1_102_o.jpeg", ratio: 0.6667 },
    ],
  },
  {
    id: "scotland-2021",
    title: "Scotland",
    when: "August 2021",
    places: "Edinburgh · Aberdeenshire",
    cover: "/uploads/4E5F33F9-CFA4-43FB-9261-DBD59D49A6B8_4_5005_c.jpeg",
    statement:
      "Stone, mist, and weather. Castles half-returned to the cliffs they were built from. The hush of looking out through an arrow slit.",
    photos: [
      { src: "/uploads/4E5F33F9-CFA4-43FB-9261-DBD59D49A6B8_4_5005_c.jpeg", ratio: 1.5 },
      { src: "/uploads/8B6B6EB1-225B-4838-A853-CAB226760040_1_105_c.jpeg", ratio: 1.5 },
      { src: "/uploads/3C7B66C5-BA90-431E-AA49-A4667B229760_4_5005_c.jpeg", ratio: 1.5 },
      { src: "/uploads/D01A75B3-72DA-44A1-9F8B-4D615A9626F2_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/A155B16A-F6F5-4091-A1CE-B5DEAACAFC8D_4_5005_c.jpeg", ratio: 1.5 },
      { src: "/uploads/8E85588C-3411-4D6F-A7AD-CCC30B5803C9_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/E9107AE7-A19B-465B-9D39-91FAA68299F0_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/9CD1315B-E902-4EDE-AB0B-4FBA8ABD8B6E_1_105_c.jpeg", ratio: 1.5 },
      { src: "/uploads/226019BB-104C-4B39-AB26-D5EB0D09C9B9_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/70455A56-D06F-46B2-BE13-616A78507246_4_5005_c.jpeg", ratio: 0.6667 },
    ],
  },
  {
    id: "italy-2020",
    title: "Italy",
    when: "February 2020",
    places: "Roma · Milano · Venezia",
    cover: "/uploads/6A69C4DF-5ADC-4AEE-893A-D647199ED780.jpeg",
    statement:
      "A long, slow inheritance of architecture — Roman ruins, Milanese marble, Venetian shutters opened onto a pink wall.",
    photos: [
      { src: "/uploads/6A69C4DF-5ADC-4AEE-893A-D647199ED780.jpeg", ratio: 0.5625 },
      { src: "/uploads/01E61365-D683-480B-A8A7-07E8FC493A32_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/17FF2654-4A91-4C90-B81A-B2A31ED1CE9F_4_5005_c.jpeg", ratio: 1.5 },
      { src: "/uploads/517B98DB-DA14-49BD-8E06-9A7E2FE5B866_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/7AE9FB2C-BFAD-46FE-B4DD-E2E99991B0EF_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/F4605188-C4FC-4B12-9C97-5BFD4F227680_1_105_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/8F3AB050-2D68-46FB-A07A-06DAE200D49B_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/03F2DBF8-7EC9-40DB-92B5-C1903D0AE8D9_4_5005_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/5D802910-AF1E-44AA-A90C-D67951463F6C_1_105_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/63F7AFC7-7EC2-4FAD-AEE3-73B968DB4AC9_4_5005_c.jpeg", ratio: 0.6667 },
    ],
  },
  {
    id: "france-2020",
    title: "France",
    when: "January 2020",
    places: "Paris",
    cover: "/uploads/51DCB02A-057A-4C68-8A42-3ABB8EDBB88F_1_102_o.jpeg",
    statement:
      "Paris in dry summer light. A statue inside the Louvre with the colour of bone; the city seen down the inside of a spiral.",
    photos: [
      { src: "/uploads/51DCB02A-057A-4C68-8A42-3ABB8EDBB88F_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/06FA9AE3-0F09-40B2-A975-349FB5C80F25_1_105_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/E02DE441-9A9F-4A61-9681-EF0F6F09CCBD_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/F66BC0C7-8DA7-4AF6-9EC2-5FD890850050_1_105_c.jpeg", ratio: 0.6667 },
      { src: "/uploads/212F6FAD-2425-4B6D-BEE9-0ED087C75CC2_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/CD349392-DA8F-4E6B-B52B-9A1140D4E1CB_1_102_o.jpeg", ratio: 1.5 },
      { src: "/uploads/DCB2555E-17BC-4A7D-85AD-87E00376BFBA_1_102_o.jpeg", ratio: 0.6667 },
      { src: "/uploads/62076888-BF6C-489D-8EB8-BCE417138CDF_1_102_o.jpeg", ratio: 1.5 },
    ],
  },
];

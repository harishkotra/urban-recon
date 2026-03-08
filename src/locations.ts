export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number; // Custom zoom level to best showcase the layout
  hints: string[];
}

export const locations: Location[] = [
  {
    id: "1",
    name: "Paris, France",
    lat: 48.8738,
    lng: 2.2950,
    zoom: 15,
    hints: [
      "Urban plan: L'Étoile (The Star)",
      "Radial street layout converging on a central monument",
      "Haussmann-style block density"
    ]
  },
  {
    id: "2",
    name: "Washington D.C., USA",
    lat: 38.8895,
    lng: -77.0353,
    zoom: 15,
    hints: [
      "Urban plan: L'Enfant Plan",
      "Grid system intersected by wide diagonal avenues",
      "Multiple circular and rectangular hubs/parks"
    ]
  },
  {
    id: "3",
    name: "Barcelona, Spain",
    lat: 41.3935,
    lng: 2.1648,
    zoom: 16,
    hints: [
      "Urban plan: Cerdà Plan (Eixample)",
      "Strict octagonal grid with chamfered corners",
      "Uniform block size with internal courtyards"
    ]
  },
  {
    id: "4",
    name: "Venice, Italy",
    lat: 45.4340,
    lng: 12.3380,
    zoom: 15,
    hints: [
      "Urban plan: Archipelago/Canal-based",
      "Dense, organic pedestrian network with no car roads",
      "Major S-shaped artery (Canal Grande)"
    ]
  },
  {
    id: "5",
    name: "Brasília, Brazil",
    lat: -15.7833,
    lng: -47.9167,
    zoom: 14,
    hints: [
      "Urban plan: Plano Piloto (Airplane Shape)",
      "Modernist monumental axis and residential wings",
      "Purpose-built capital city from the 20th century"
    ]
  },
  {
    id: "6",
    name: "New York City, USA",
    lat: 40.7812,
    lng: -73.9665,
    zoom: 14,
    hints: [
      "Urban plan: Commissioners' Plan of 1811",
      "Dominant rectangular grid (Manhattan Grid)",
      "Massive rectangular central void (Park)"
    ]
  }
];

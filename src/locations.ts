export interface Location {
  id: string;
  name: string;
  imageUrl: string;
  lat: number;
  lng: number;
  hints: string[];
}

export const locations: Location[] = [
  {
    id: "1",
    name: "Eiffel Tower, Paris",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
    lat: 48.8584,
    lng: 2.2945,
    hints: ["Iron structure", "European capital", "Romantic city"]
  },
  {
    id: "2",
    name: "Shibuya Crossing, Tokyo",
    imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
    lat: 35.6595,
    lng: 139.7005,
    hints: ["Neon signs", "Massive pedestrian crossing", "Asian metropolis"]
  },
  {
    id: "3",
    name: "Times Square, New York",
    imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80",
    lat: 40.7580,
    lng: -73.9855,
    hints: ["Bright billboards", "Yellow taxis", "The Big Apple"]
  },
  {
    id: "4",
    name: "Santorini, Greece",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    lat: 36.3932,
    lng: 25.4615,
    hints: ["White buildings", "Blue domes", "Aegean Sea"]
  },
  {
    id: "5",
    name: "Opera House, Sydney",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    lat: -33.8568,
    lng: 151.2153,
    hints: ["Sail-like architecture", "Harbour bridge nearby", "Southern hemisphere"]
  }
];

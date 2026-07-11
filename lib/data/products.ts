import { SpecGroup } from "../types";

export interface StaticProduct {
  slug: string;
  categorySlug: string;
  name: string;
  tagline: string;
  description: string[];
  image: string;
  variants?: string[];
  specGroups?: SpecGroup[];
  standardEquipment?: string[];
  keywords: string[];
}

export const products: StaticProduct[] = [
  // ---------------------------------------------------------------
  // VMC 650
  // ---------------------------------------------------------------
  {
    slug: "vmc-650",
    categorySlug: "vertical-milling-centers",
    name: "VMC 650 Vertical Machining Centre",
    tagline: "Compact-footprint BT40 machining centre with 20-tool ATC",
    description: [
      "The VMC 650 is a BT40 vertical machining centre suited to general production and tooling work where floor space is at a premium. A GSK servo spindle unit and 600/320/450mm X/Y/Z travel cover most mould, fixture, and small-batch part work.",
      "A 20-tool arm-type tool changer with a 3-second change time keeps cycle times tight, while a 1000 x 320mm table and 300kg maximum load suit fixtures and vices for steel and aluminum components.",
    ],
    image: "/images/vmc-650.jpg",
    specGroups: [
      {
        title: "Table",
        rows: [
          { label: "Table size", value: "1000 x 320 mm" },
          { label: "T-slot (width x number x distance)", value: "18 x 3 x 100 mm" },
          { label: "Maximum load", value: "300 kg" },
        ],
      },
      {
        title: "Travel",
        rows: [
          { label: "X / Y / Z travel", value: "600 / 320 / 450 mm" },
          { label: "Spindle nose to table", value: "70 - 520 mm" },
        ],
      },
      {
        title: "Spindle",
        rows: [
          { label: "Spindle taper", value: "BT40" },
          { label: "Spindle speed", value: "80 - 8000 rpm" },
          { label: "Spindle motor power", value: "7.5 / 11 kW GSK servo spindle unit" },
        ],
      },
      {
        title: "Feed",
        rows: [
          { label: "Rapid feed X / Y / Z", value: "15 / 15 / 12 m/min" },
          { label: "X / Y / Z motor torque", value: "15 / 15 / 15 Nm" },
        ],
      },
      {
        title: "Accuracy",
        rows: [
          { label: "Positioning accuracy", value: "0.008 mm" },
          { label: "Positioning repeatability", value: "0.003 mm" },
        ],
      },
      {
        title: "Arm tool changer",
        rows: [
          { label: "Number of tools", value: "20 tools" },
          { label: "Maximum tool length", value: "300 mm" },
          { label: "Maximum tool weight", value: "8 kg" },
          { label: "Tool changing time (cam box)", value: "3 sec" },
        ],
      },
      {
        title: "General",
        rows: [
          { label: "Power", value: "380 V 3PH, 50/60 Hz, 12 kVA" },
          { label: "Air consumption", value: "6 kg/cm², 0.6 MPa" },
          { label: "Dimensions (L x W x H)", value: "2100 x 1700 x 2400 mm" },
          { label: "Weight", value: "3,500 kg" },
        ],
      },
    ],
    keywords: ["VMC 650", "vertical machining centre Dubai", "BT40 CNC mill UAE", "GSK servo spindle"],
  },

  // ---------------------------------------------------------------
  // VMC 850
  // ---------------------------------------------------------------
  {
    slug: "vmc-850",
    categorySlug: "vertical-milling-centers",
    name: "VMC 850 Vertical Machining Centre",
    tagline: "Large-table BT40 machining centre with 24-tool ATC",
    description: [
      "The VMC 850 steps up to an 1000 x 500mm table and 800/500/500mm X/Y/Z travel, with a 500kg maximum load — suited to larger fixtures, multi-part setups, and heavier stock removal.",
      "A 24-tool arm-type tool changer with a 2.5-second change time, 24 m/min rapids on all three axes, and 0.001mm positioning accuracy make it a strong fit for production work that needs both capacity and precision.",
    ],
    image: "/images/vmc-850.jpg",
    specGroups: [
      {
        title: "Table",
        rows: [
          { label: "Table size", value: "1000 x 500 mm" },
          { label: "T-slot (width x number x distance)", value: "18 x 5 x 100 mm" },
          { label: "Maximum load", value: "500 kg" },
        ],
      },
      {
        title: "Travel",
        rows: [
          { label: "X / Y / Z travel", value: "800 / 500 / 500 mm" },
          { label: "Spindle nose to table", value: "150 - 650 mm" },
          { label: "Spindle centre to column", value: "550 mm" },
        ],
      },
      {
        title: "Spindle",
        rows: [
          { label: "Spindle taper", value: "BT40" },
          { label: "Spindle speed", value: "80 - 8000 rpm" },
          { label: "Spindle motor power", value: "7.5 / 11 kW GSK servo spindle unit" },
        ],
      },
      {
        title: "Feed",
        rows: [
          { label: "Rapid feed X / Y / Z", value: "24 / 24 / 20 m/min" },
          { label: "Cutting feed rate", value: "10 m/min" },
          { label: "X / Y / Z motor torque", value: "15 / 15 / 22 Nm" },
        ],
      },
      {
        title: "Accuracy",
        rows: [
          { label: "Positioning accuracy", value: "0.001 mm" },
          { label: "Positioning repeatability", value: "0.006 mm" },
        ],
      },
      {
        title: "Arm tool changer",
        rows: [
          { label: "Number of tools", value: "24 tools" },
          { label: "Maximum tool length", value: "250 mm" },
          { label: "Maximum tool weight", value: "7 kg" },
          { label: "Tool changing time (cam box)", value: "2.5 sec" },
        ],
      },
      {
        title: "General",
        rows: [
          { label: "Power", value: "380 V 3PH, 50/60 Hz, 22 kVA" },
          { label: "Air consumption", value: "250 L/min, 0.6 MPa" },
          { label: "Dimensions (L x W x H)", value: "2600 x 2400 x 2700 mm" },
          { label: "Weight", value: "5,000 kg" },
        ],
      },
    ],
    keywords: ["VMC 850", "vertical machining centre Dubai", "BT40 CNC mill UAE", "large table CNC mill"],
  },

  // ---------------------------------------------------------------
  // CNC Lathe
  // ---------------------------------------------------------------
  {
    slug: "cnc-lathe-1020",
    categorySlug: "cnc-lathes",
    name: "CNC Lathe — 1020mm Centre Height",
    tagline: "Heavy-duty horizontal CNC lathe with GSK 988T control",
    description: [
      "A heavy-duty horizontal CNC lathe with a 1020mm centre height, D550mm maximum swing, and 1000mm turning length — built for shafts, flanges, and general turning work in steel and other metals.",
      "Standard equipment includes an 8-inch hollow chuck, 8-station horizontal turret, fully enclosed guarding with telescopic covers, automatic lubrication, coolant system, and a GSK 988T CNC controller with an electronic handwheel (MPG).",
    ],
    image: "/images/cnc-lathe.jpg",
    specGroups: [
      {
        title: "Capacity",
        rows: [
          { label: "Max swing", value: "D550 mm" },
          { label: "Swing over slide", value: "D360 mm" },
          { label: "Recommended standard turning diameter", value: "D250 mm" },
          { label: "Max turning diameter", value: "D360 mm (flange type) / D320 mm (shaft type)" },
          { label: "Loading capacity", value: "200 kg (flange type) / 500 kg (shaft type)" },
          { label: "Turning length", value: "1000 mm" },
          { label: "Max pulling through job", value: "D50 mm" },
        ],
      },
      {
        title: "Spindle",
        rows: [
          { label: "Spindle type", value: "A2-6" },
          { label: "Spindle taper", value: "D70 mm, 1:20" },
          { label: "Spindle diameter", value: "D66 mm" },
          { label: "Spindle speed", value: "50 - 400 rpm (servo)" },
          { label: "Spindle motor power", value: "11 kW" },
          { label: "Centre height", value: "1020 mm" },
        ],
      },
      {
        title: "Turret & tooling",
        rows: [
          { label: "Chuck", value: "8 inch hollow" },
          { label: "Turret", value: "8 station, horizontal" },
          { label: "Tool shank", value: "25 x 25 mm (D40 boring bar)" },
          { label: "Rapid speed X / Z", value: "24 m/min" },
        ],
      },
      {
        title: "Accuracy & control",
        rows: [
          { label: "Positioning accuracy", value: "0.022 mm" },
          { label: "Positioning repeatability", value: "0.006 mm" },
          { label: "CNC system", value: "GSK 988T / GS" },
        ],
      },
      {
        title: "General",
        rows: [
          { label: "Power", value: "380 V +10%, 50 Hz, 35 kVA" },
          { label: "Dimensions (L x W x H)", value: "4000 x 2000 x 2050 mm" },
          { label: "Weight", value: "5,200 kg" },
        ],
      },
    ],
    standardEquipment: [
      "GSK 988T CNC controller",
      "X-axis servo motor with brake",
      "Fully enclosed with telescopic guards",
      "Automatic lubrication system",
      "Coolant system",
      "Air-conditioned electrical cabinet",
      "LED working lamp",
      "Electronic handwheel (MPG)",
      "Operation manual and tool box",
      "Levelling bolts and blocks",
      "Power supply: 380V / 3PH, 50Hz",
      "Face mount (1 pc) and boring mount (3 pcs)",
    ],
    keywords: ["CNC lathe Dubai", "GSK 988T lathe", "8 inch chuck CNC lathe", "heavy duty CNC lathe UAE"],
  },

  // ---------------------------------------------------------------
  // Tapping machine
  // ---------------------------------------------------------------
  {
    slug: "rtm-u324",
    categorySlug: "tapping-machines",
    name: "RTM-U-324 Pneumatic Arm Tapping Machine",
    tagline: "Flexible-arm pneumatic tapper for M3–M24 taps",
    description: [
      "The RTM-U-324 is a flexible-arm pneumatic tapping machine for taps from M3 to M24 (5/32\" to 3/8\"), suited to bench or floor-mounted tapping stations on brackets, flanges, and fabricated parts.",
      "It's available in two work-range variants — 1500 RPM and 1900 RPM models — covering working ranges of 15–1500mm and 15–1900mm respectively. Both run on 220V, 50Hz single-phase power and 0–300 RPM tapping speed.",
    ],
    image: "/images/tapping-machines.jpg",
    variants: ["RTM-U-324-1500 RPM", "RTM-U-324-1900 RPM"],
    specGroups: [
      {
        title: "Specification",
        rows: [
          { label: "For taps", value: "M3 - M24 / 5/32\" - 3/8\"" },
          { label: "Speed", value: "0 - 300 rpm" },
          {
            label: "Work range",
            values: {
              "RTM-U-324-1500 RPM": "15 - 1500 mm",
              "RTM-U-324-1900 RPM": "15 - 1900 mm",
            },
          },
          { label: "Power", value: "220 V, 50 Hz" },
        ],
      },
    ],
    standardEquipment: [
      "Quick tapper spindle",
      "Parallel arm",
      "Any six safety clutch tapper adapters",
      "Air processor",
      "Tooling kit",
      "Lubricating oil",
    ],
    keywords: ["pneumatic tapping machine", "RTM-U-324", "arm tapping machine UAE", "M3 to M24 tapper Dubai"],
  },
];

export function getProduct(slug: string): StaticProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): StaticProduct[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

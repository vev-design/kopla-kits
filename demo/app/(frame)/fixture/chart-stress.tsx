// Deliberately adversarial chart cases. Keep them out of the example gallery:
// these verify label geometry, rather than recommend a chart design.
import { Charts } from '../../../../components/Charts/Charts.demo';

export function LargePieLabels() {
  return <Charts {...({
    kind: "pie", title: "Regional share", labels: "outside",
    brand: { version: 1, typography: { labelSize: 24, labelFamily: "Arial, sans-serif" } },
    data: [
      { id: "north", label: "North America", value: 50 },
      { id: "south", label: "South America", value: 50 },
    ],
  })} />;
}

export function MaximumPieLabels() {
  return <Charts {...({
    kind: "pie", title: "Regional share", labels: "outside", locale: "de-DE",
    brand: { version: 1, typography: { labelSize: 72, labelFamily: "Georgia, serif", labelWeight: 700 } },
    data: [
      { id: "wide", label: "WWWWWWWWWWWWW", value: 99 },
      { id: "long", label: "A deliberately long regional label", value: 1 },
    ],
  })} />;
}

export function TenPieCategories() {
  return <Charts {...({
    kind: "pie",
    title: "Distribution",
    labels: "outside",
    data: [
      {id: "0", label: "An intentionally long category label that must remain available in the legend and data table", value: 50},
      {id: "1", label: "Category 2", value: 20},
      {id: "2", label: "Category 3", value: 10},
      {id: "3", label: "Category 4", value: 5},
      {id: "4", label: "Category 5", value: 4},
      {id: "5", label: "Category 6", value: 3},
      {id: "6", label: "Category 7", value: 3},
      {id: "7", label: "Category 8", value: 2},
      {id: "8", label: "Category 9", value: 2},
      {id: "9", label: "Category 10", value: 1},
    ],
  })} />;
}

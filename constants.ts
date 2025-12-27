import { HistoryGroup } from './types';

export const MOCK_HISTORY: HistoryGroup[] = [
  {
    date: "October 24",
    items: [
      { type: "directions_car", label: "Sedan", time: "10:00 AM", speed: 65, icon: "directions_car" },
    ]
  },
  {
    date: "October 23",
    items: [
      { type: "runner", label: "Runner", time: "6:45 PM", speed: 12, icon: "directions_run" },
      { type: "cyclist", label: "Cyclist", time: "6:30 PM", speed: 28, icon: "pedal_bike" },
    ]
  },
  {
    date: "October 22",
    items: [
      { type: "suv", label: "SUV", time: "2:15 PM", speed: 45, icon: "directions_car" },
      { type: "motorcycle", label: "Motorcycle", time: "1:15 PM", speed: 72, icon: "two_wheeler" },
    ]
  }
];

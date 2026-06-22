export const DRUG_TABS = [
  { id: 'tabDrugs', label: 'ข้อมูลยา', icon: 'bi-capsule' },
  { id: 'tabLots', label: 'Lot Stock', icon: 'bi-boxes' },
  { id: 'tabWarehouse', label: 'คลังยา', icon: 'bi-building' },
  { id: 'tabRecall', label: 'Recall', icon: 'bi-exclamation-triangle' },
  { id: 'tabStockCount', label: 'ตรวจนับ', icon: 'bi-clipboard-check' },
  { id: 'tabTemp', label: 'อุณหภูมิ', icon: 'bi-thermometer-half' },
  { id: 'tabUnitDose', label: 'Unit Dose', icon: 'bi-scissors' },
  { id: 'tabPatient', label: 'Patient Trace', icon: 'bi-person-lines-fill' },
  { id: 'tabAbc', label: 'ABC/VED', icon: 'bi-pie-chart' },
  { id: 'tabUsers', label: 'ผู้ใช้งาน', icon: 'bi-people' },
  { id: 'tabSettings', label: 'ตั้งค่า', icon: 'bi-gear' }
] as const;

export type DrugTabId = (typeof DRUG_TABS)[number]['id'];

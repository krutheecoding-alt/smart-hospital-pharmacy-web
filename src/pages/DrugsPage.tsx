import type { ComponentType } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTabs } from '../components/ui';
import {
  DRUG_TABS,
  DrugRegistryTab,
  LotStockTab,
  WarehouseTab,
  RecallTab,
  StockCountTab,
  TemperatureTab,
  UnitDoseTab,
  PatientTraceTab,
  AbcVedTab,
  UsersTab,
  SettingsTab
} from './drug';

const TAB_PANELS: Record<string, ComponentType> = {
  tabDrugs: DrugRegistryTab,
  tabLots: LotStockTab,
  tabWarehouse: WarehouseTab,
  tabRecall: RecallTab,
  tabStockCount: StockCountTab,
  tabTemp: TemperatureTab,
  tabUnitDose: UnitDoseTab,
  tabPatient: PatientTraceTab,
  tabAbc: AbcVedTab,
  tabUsers: UsersTab,
  tabSettings: SettingsTab
};

export function DrugsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'tabDrugs';
  const Panel = TAB_PANELS[tab] || DrugRegistryTab;

  return (
    <>
      <PageTabs
        tabs={[...DRUG_TABS]}
        active={tab}
        onChange={(id) => setParams({ tab: id })}
      />
      <Panel />
    </>
  );
}

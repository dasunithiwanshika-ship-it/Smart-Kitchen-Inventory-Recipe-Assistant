import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { LeftoversPage } from './components/leftovers/LeftoversPage';
import { RecipesPage } from './components/recipes/RecipesPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { AssistantPage } from './components/assistant/AssistantPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { AddFoodModal } from './components/inventory/AddFoodModal';
import { BarcodeScannerModal } from './components/inventory/BarcodeScannerModal';
import { AddLeftoverModal } from './components/leftovers/AddLeftoverModal';
import { api } from './services/api';
import { InventoryItem, BarcodeLookup, StorageType } from './types';

const MainApp: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [urgentItems, setUrgentItems] = useState<InventoryItem[]>([]);

  // Navigation Filter state
  const [inventoryStorageFilter, setInventoryStorageFilter] = useState<string>('All');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>('All');
  const [recipeSearchQuery, setRecipeSearchQuery] = useState<string>('');

  // Global Modals
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isAddLeftoverModalOpen, setIsAddLeftoverModalOpen] = useState(false);
  const [scannedInitialData, setScannedInitialData] = useState<any>(null);

  const fetchUrgentItems = async () => {
    if (!token) return;
    try {
      const items = await api.getInventory({ sort_by: 'expiry_date_asc' });
      setUrgentItems(items.filter((i) => i.days_until_expiry <= 3));
    } catch (err) {
      console.warn('Failed to fetch urgent items', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUrgentItems();
    }
  }, [token, currentTab]);

  const handleNavigateToTab = (tab: string, storage?: string, status?: string) => {
    if (storage) setInventoryStorageFilter(storage);
    if (status) setInventoryStatusFilter(status);
    setCurrentTab(tab);
  };

  const handleBarcodeConfirmed = (lookup: BarcodeLookup) => {
    setScannedInitialData({
      food_name: lookup.food_name || '',
      category_id: lookup.category_id,
      barcode: lookup.barcode,
      quantity: 1,
      unit: lookup.default_unit || 'pieces',
      storage_location: lookup.suggested_storage || 'Refrigerator',
      typical_shelf_life_days: lookup.typical_shelf_life_days || 7,
      image_url: lookup.image_url,
    });
    setIsAddFoodModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse mb-3">
          <span className="text-xl">🍳</span>
        </div>
        <p className="text-xs font-semibold">Initializing Smart Kitchen AI...</p>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        urgentCount={urgentItems.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onAddFoodClick={() => {
            setScannedInitialData(null);
            setIsAddFoodModalOpen(true);
          }}
          urgentItems={urgentItems}
        />

        {/* Page Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToTab={handleNavigateToTab}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenAddFood={() => {
                setScannedInitialData(null);
                setIsAddFoodModalOpen(true);
              }}
              onOpenAddLeftover={() => setIsAddLeftoverModalOpen(true)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryPage
              initialStorage={inventoryStorageFilter}
              initialStatus={inventoryStatusFilter}
              onOpenScanner={() => setIsScannerModalOpen(true)}
            />
          )}

          {currentTab === 'scan' && (
            <div className="py-6">
              <BarcodeScannerModal
                isOpen={true}
                onClose={() => setCurrentTab('inventory')}
                onProductConfirmed={handleBarcodeConfirmed}
              />
            </div>
          )}

          {currentTab === 'recipes' && (
            <RecipesPage initialSearchQuery={recipeSearchQuery} />
          )}

          {currentTab === 'leftovers' && (
            <LeftoversPage
              onFindRecipesForLeftover={(loName) => {
                setRecipeSearchQuery(loName);
                setCurrentTab('recipes');
              }}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'assistant' && (
            <AssistantPage
              onSelectRecipeTitle={(title) => {
                setRecipeSearchQuery(title);
                setCurrentTab('recipes');
              }}
            />
          )}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        urgentCount={urgentItems.length}
      />

      {/* Global Modals */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => {
          setIsAddFoodModalOpen(false);
          setScannedInitialData(null);
        }}
        onItemAdded={fetchUrgentItems}
        initialData={scannedInitialData}
      />

      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onProductConfirmed={handleBarcodeConfirmed}
      />

      <AddLeftoverModal
        isOpen={isAddLeftoverModalOpen}
        onClose={() => setIsAddLeftoverModalOpen(false)}
        onLeftoverAdded={fetchUrgentItems}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

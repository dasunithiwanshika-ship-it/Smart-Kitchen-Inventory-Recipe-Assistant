import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { ProductDateScannerModal, ScannedProductPayload } from './components/inventory/ProductDateScannerModal';
import { AddLeftoverModal } from './components/leftovers/AddLeftoverModal';
import { api } from './services/api';
import { InventoryItem } from './types';

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
      setUrgentItems(
        items.filter(
          (i) => i.expiry_date && i.days_until_expiry !== null && i.days_until_expiry <= 3
        )
      );
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

  const handleProductScanned = (payload: ScannedProductPayload) => {
    setScannedInitialData({
      food_name: payload.food_name,
      purchase_date: payload.purchase_date,
      expiry_date: payload.expiry_date,
      no_expiry_date: payload.no_expiry_date,
      storage_location: payload.storage_location || 'Refrigerator',
      notes: payload.notes,
      image_url: payload.image_url,
    });
    setIsAddFoodModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e9e7df] flex flex-col items-center justify-center text-[#16193a]">
        <div className="px-6 py-4 rounded-[14px] bg-white flex flex-col items-center">
          <span className="text-2xl font-semibold tracking-[-0.03em] text-[#141a4a] animate-pulse">
            olla
          </span>
          <p className="text-xs font-medium text-[#16193a]/70 mt-1">Loading your smart kitchen...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#e9e7df] text-[#16193a] pb-24 lg:pb-12">
      {/* Floating olla Top Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onAddFoodClick={() => {
          setScannedInitialData(null);
          setIsAddFoodModalOpen(true);
        }}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenAddLeftover={() => setIsAddLeftoverModalOpen(true)}
        urgentItems={urgentItems}
      />

      {/* Main Content Container matching olla's 87vw frame */}
      <main className="pt-[84px] md:pt-[calc(1.6vh+54px+1.6vw)] w-[calc(100vw-24px)] md:w-[87vw] mx-auto">
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
          <div className="bg-white rounded-[14px] p-4 sm:p-6">
            <InventoryPage
              initialStorage={inventoryStorageFilter}
              initialStatus={inventoryStatusFilter}
              onOpenScanner={() => setIsScannerModalOpen(true)}
            />
          </div>
        )}

        {currentTab === 'scan' && (
          <div className="bg-white rounded-[14px] p-4 sm:p-6 max-w-2xl mx-auto">
            <ProductDateScannerModal
              isOpen={true}
              onClose={() => setCurrentTab('inventory')}
              onProductScanned={handleProductScanned}
              onOpenManualEntry={() => {
                setCurrentTab('inventory');
                setScannedInitialData(null);
                setIsAddFoodModalOpen(true);
              }}
            />
          </div>
        )}

        {currentTab === 'recipes' && (
          <div className="bg-white rounded-[14px] p-4 sm:p-6">
            <RecipesPage initialSearchQuery={recipeSearchQuery} />
          </div>
        )}

        {currentTab === 'leftovers' && (
          <div className="bg-white rounded-[14px] p-4 sm:p-6">
            <LeftoversPage
              onFindRecipesForLeftover={(loName) => {
                setRecipeSearchQuery(loName);
                setCurrentTab('recipes');
              }}
            />
          </div>
        )}

        {currentTab === 'analytics' && (
          <div className="bg-white rounded-[14px] p-4 sm:p-6">
            <AnalyticsPage />
          </div>
        )}

        {currentTab === 'assistant' && (
          <div className="bg-white rounded-[14px] p-4 sm:p-6">
            <AssistantPage
              onSelectRecipeTitle={(title) => {
                setRecipeSearchQuery(title);
                setCurrentTab('recipes');
              }}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="bg-white rounded-[14px] p-4 sm:p-6">
            <SettingsPage />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        urgentCount={urgentItems.length}
      />

      {/* Global Add & Edit Modals */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => {
          setIsAddFoodModalOpen(false);
          setScannedInitialData(null);
        }}
        onItemAdded={fetchUrgentItems}
        initialData={scannedInitialData}
      />

      <ProductDateScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onProductScanned={handleProductScanned}
        onOpenManualEntry={() => {
          setIsScannerModalOpen(false);
          setScannedInitialData(null);
          setIsAddFoodModalOpen(true);
        }}
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

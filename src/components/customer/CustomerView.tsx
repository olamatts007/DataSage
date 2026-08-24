import React from 'react';
import { BookingHero } from './BookingHero';
import { LiveBookingTracker } from './LiveBookingTracker';
import { CustomerHistory } from './CustomerHistory';
import { ContractsHub } from './ContractsHub';
import { CommercialHome } from '../commercial/CommercialHome';
import { AirbnbHostPortal } from '../airbnb/AirbnbHostPortal';
import { PanAfricanPortal } from '../expansion/PanAfricanPortal';

export const CustomerView: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMsds: () => void;
}> = ({ activeTab, setActiveTab, onOpenMsds }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {activeTab === 'home' && (
        <CommercialHome
          onBookNow={() => setActiveTab('explore')}
          onCreateContract={() => setActiveTab('contracts')}
          onOpenMsds={onOpenMsds}
        />
      )}

      {activeTab === 'explore' && (
        <BookingHero onBookingCreated={() => setActiveTab('live_tracker')} />
      )}

      {activeTab === 'airbnb' && (
        <AirbnbHostPortal onTurnoverDispatched={() => setActiveTab('live_tracker')} />
      )}

      {activeTab === 'contracts' && (
        <ContractsHub
          onCreateNewContract={() => setActiveTab('explore')}
          onViewLiveTracker={() => setActiveTab('live_tracker')}
        />
      )}

      {activeTab === 'live_tracker' && (
        <LiveBookingTracker onOpenMsds={onOpenMsds} />
      )}

      {activeTab === 'history' && (
        <CustomerHistory />
      )}

      {activeTab === 'african_expansion' && (
        <PanAfricanPortal />
      )}
    </div>
  );
};

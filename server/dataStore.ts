import { Tender, Bidder } from '../src/types';

class DataStore {
  private tenders: Map<string, Tender> = new Map();
  private bidders: Map<string, Bidder> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.tenders.clear();
    this.bidders.clear();
  }

  getAllTenders(): Tender[] {
    return Array.from(this.tenders.values());
  }

  getTender(id: string): Tender | undefined {
    return this.tenders.get(id);
  }

  addTender(tender: Tender): Tender {
    this.tenders.set(tender.id, tender);
    return tender;
  }

  getAllBidders(tenderId?: string): Bidder[] {
    const list = Array.from(this.bidders.values());
    return tenderId ? list.filter(b => b.tenderId === tenderId) : list;
  }

  getBidder(id: string): Bidder | undefined {
    return this.bidders.get(id);
  }

  saveBidder(bidder: Bidder): Bidder {
    this.bidders.set(bidder.id, bidder);
    return bidder;
  }
}

export const dataStore = new DataStore();

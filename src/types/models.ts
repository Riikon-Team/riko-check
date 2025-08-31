type EventType = {
  id: string;
  name: string;
  description: string;
  types: string[];
  requiresAuth: boolean;      
  ipAllowList: string[];       
  startAt: string;             
  endAt: string;               
  nonceTTL: number;            
};

type AttendanceType = {
  eventId: string;
  userId?: string;             
  ip: string;
  uaHash: string;             
  at: string;                  
  nonce?: string;             
};

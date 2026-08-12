export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdBy: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  placeId: string;
  userId: string;
  photoUrls: string[];
  comment: string | null;
  memoryDate: string;
  companion: string | null;
  createdAt: string;
}

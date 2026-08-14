export interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewPage {
  content: Review[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

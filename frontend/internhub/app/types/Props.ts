import { Application } from './Application';
import { Advisor } from './Application';

// ApplicationPopup Props
export interface ApplyInternshipDialogProps {
  onSubmit: (application: Application) => void;
  triggerText?: string;
  companyId?: string;
  className?: string;
  disabled?: boolean;
}

// AdvisorPopup Props
export interface AddAdvisorDialogProps {
  onSubmit: (advisor: Advisor) => void;
  triggerText?: string;
}

// Table Column Definition
export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
}

// Pagination Props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

// Filter Props
export interface FilterProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}
export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  className?: string;
}

export interface FinanceSummary {
  totalSales: number;
  totalExpenses: number;
  studentContribution: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmado' | 'em breve' | 'cancelado';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'venda' | 'despesa';
}

export interface Notice {
  id: string;
  content: string;
  date: string;
}

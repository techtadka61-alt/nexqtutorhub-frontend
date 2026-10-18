import { api } from "../api-client";

export type CatalogType = "class" | "subject" | "board" | "qualification";

export interface CatalogOptions {
  classes: string[];
  subjects: string[];
  boards: string[];
  qualifications: string[];
}

export interface CatalogItem {
  _id: string;
  type: CatalogType;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export const catalogApi = {
  /** Public: the visible dropdown options. */
  options: () => api.get<CatalogOptions & { message: string }>("/catalog", { auth: false }),
  // admin
  list: (type?: CatalogType) =>
    api.get<{ message: string; items: CatalogItem[] }>(`/catalog/items${type ? `?type=${type}` : ""}`),
  create: (type: CatalogType, name: string) =>
    api.post<{ message: string; item: CatalogItem }>("/catalog/items", { type, name }),
  update: (id: string, changes: { isActive?: boolean; sortOrder?: number }) =>
    api.patch<{ message: string; item: CatalogItem }>(`/catalog/items/${id}`, changes),
  remove: (id: string) => api.delete<{ message: string }>(`/catalog/items/${id}`),
};

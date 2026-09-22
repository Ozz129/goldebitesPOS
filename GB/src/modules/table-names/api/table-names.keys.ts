export const tableNamesKeys = {
  all: ['table-names'] as const,
  byBranch: (branchId: string) => [...tableNamesKeys.all, 'branch', branchId] as const,
};

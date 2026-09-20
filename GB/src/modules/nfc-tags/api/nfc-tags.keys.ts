export const nfcTagsKeys = {
  all: ['nfc-tags'] as const,
  byBranch: (branchId: string) => [...nfcTagsKeys.all, 'branch', branchId] as const,
};

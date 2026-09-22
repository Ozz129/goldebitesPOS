export const hrKeys = {
  all: ['hr'] as const,
  branchRules: (branchId: string) => [...hrKeys.all, 'branch-rules', branchId] as const,
  myProfile: () => [...hrKeys.all, 'my-profile'] as const,
};

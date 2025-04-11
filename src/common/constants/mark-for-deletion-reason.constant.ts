export enum MarkForDeletionReason {
  Testing = 'This is a test endpoint and should be removed before production',
  Deprecated = 'This endpoint is deprecated and will be removed in future versions',
  TemporaryFix = 'Temporary workaround - remove after core issue is resolved',
}

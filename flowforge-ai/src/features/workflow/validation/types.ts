export type ValidationSeverity = "error" | "warning";

export interface WorkflowValidationIssue {
  id: string;
  severity: ValidationSeverity;
  message: string;
  nodeId?: string;
  edgeId?: string;
  field?: string;
  code?: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: WorkflowValidationIssue[];
  warnings: WorkflowValidationIssue[];
}

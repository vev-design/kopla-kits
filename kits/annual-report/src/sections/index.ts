// Public section catalog for the Annual Report system. The renderer imports
// this barrel as a namespace and looks sections up by `type` string.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — top to bottom, the way a complete annual report reads. Rearrange
// the lines to reorder the chain.
export * from './Cover';
export * from './LetterFromLeadership';
export * from './Highlights';
export * from './FinancialChart';
export * from './SegmentBreakdown';
export * from './Milestones';
export * from './Outlook';
export * from './Closing';

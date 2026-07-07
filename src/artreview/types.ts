export type ArtCandidateCategory = "character" | "prop" | "overlay" | "background";

export type ArtCandidateStatus = "keep" | "refine" | "reject" | "later";

export interface ArtCandidate {
  id: string;
  title: string;
  category: ArtCandidateCategory;
  status: ArtCandidateStatus;
  notes: string;
  priority: number;
  imageRef: string;
  createdAt: string;
}

export const ART_CANDIDATE_CATEGORIES: ArtCandidateCategory[] = [
  "character",
  "prop",
  "overlay",
  "background"
];

export const ART_CANDIDATE_STATUSES: ArtCandidateStatus[] = ["keep", "refine", "reject", "later"];

export const CATEGORY_LABEL: Record<ArtCandidateCategory, string> = {
  character: "Character",
  prop: "Prop",
  overlay: "Overlay",
  background: "Background"
};

export const STATUS_LABEL: Record<ArtCandidateStatus, string> = {
  keep: "Keep",
  refine: "Refine",
  reject: "Reject",
  later: "Later"
};

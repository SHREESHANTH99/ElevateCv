import { useQuery } from "@tanstack/react-query";
import { ResumeApi } from "../../services/resumeApi";
import type { ResumeData } from "../../types/auth";

export const resumeKeys = {
  all: ["resumes"] as const,
  list: () => [...resumeKeys.all, "list"] as const,
  detail: (id: string) => [...resumeKeys.all, "detail", id] as const,
};

export function useResumes() {
  return useQuery<ResumeData[], Error>({
    queryKey: resumeKeys.list(),
    queryFn: ResumeApi.getResumes,
  });
}

export function useResume(id?: string) {
  return useQuery<ResumeData | null, Error>({
    queryKey: id ? resumeKeys.detail(id) : resumeKeys.all,
    queryFn: () => ResumeApi.getResume(id),
    enabled: Boolean(id),
  });
}

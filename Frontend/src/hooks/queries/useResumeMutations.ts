import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResumeApi } from "../../services/resumeApi";
import { resumeKeys } from "./useResumes";

export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ResumeApi.createResume,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resumeKeys.list(),
      });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ResumeApi.updateResume,
    onSuccess: (updatedResume) => {
      queryClient.invalidateQueries({
        queryKey: resumeKeys.list(),
      });

      if (updatedResume._id) {
        queryClient.invalidateQueries({
          queryKey: resumeKeys.detail(updatedResume._id),
        });
      }
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ResumeApi.deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resumeKeys.list(),
      });
    },
  });
}

import { QueryClient } from "@tanstack/react-query";

// Create query client
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getContext() {
  const queryClient = createQueryClient();

  return {
    queryClient,
  };
}

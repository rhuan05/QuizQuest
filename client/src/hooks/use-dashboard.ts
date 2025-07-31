import { useDashboardContext } from "@/contexts/dashboard-context";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export function useDashboard() {
    const { state, dispatch } = useDashboardContext();
    
    const startDashboardMutation = useMutation({
        mutationFn: async () => {
            const questionsCompleted = await apiRequest("GET", "/api/quiz/dashboard");
            const questionsData = await questionsCompleted.json();

            return questionsData;
        },
        onSuccess: (data) => {
            dispatch({
                type: 'START_DASHBOARD',
                payload: data
            });
        }
    });

    const startDashboard = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const result = await startDashboardMutation.mutateAsync();

        return result;
    }

    const resetDashboard = () => {
        dispatch({ type: 'RESET_DASHBOARD' });
    };

    return {
        ...state,
        resetDashboard,
        startDashboard,
        isLoading: state.isLoading
    }
}
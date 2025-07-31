import { QuizSession } from "@shared/schema";
import React, { createContext, ReactNode, useContext, useReducer } from "react"

interface DashboardState {
    quizCompleted: QuizSession[] | null;
    isLoading: boolean;
}

type DashboardAction = 
    | { type: 'SET_LOADING', payload: boolean }
    | { type: 'START_DASHBOARD', payload: QuizSession[] }
    | { type: 'RESET_DASHBOARD' }

const initialState: DashboardState = {
    quizCompleted: null,
    isLoading: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state,  quizCompleted: null, isLoading: action.payload };
        
        case 'START_DASHBOARD':
            return { ...state, quizCompleted: action.payload, isLoading: false };
        
        case 'RESET_DASHBOARD':
            return initialState;
        
        default:
            return state;
    }
}

const DashboardContext = createContext<{
   state: DashboardState;
   dispatch: React.Dispatch<DashboardAction> 
} | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }){
    const [state, dispatch] = useReducer(dashboardReducer, initialState)

    return (
        <DashboardContext.Provider value={{ state, dispatch }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashBoardProvier')
    }
    return context;
}

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Action, ActionType, Ingredient, PrepItem, CookingItem } from '../types';
import { DEFAULT_INGREDIENTS } from '../constants';

const initialState: AppState = {
  ingredients: DEFAULT_INGREDIENTS,
  prepItems: [],
  cookingItems: [],
  admin: {
    isSetup: false,
    isAuthenticated: false,
  },
  hasSeenGuide: false
};

const STORAGE_KEY = 'hotpot_timer_data_v1';
const ADMIN_KEY = 'hotpot_timer_admin_v1';
const GUIDE_KEY = 'hotpot_timer_guide_v1';

const dataReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case ActionType.LOAD_DATA:
      return { ...state, ...action.payload };

    case ActionType.ADD_TO_PREP: {
      const ingredientId = action.payload;
      const ingredient = state.ingredients.find((i: Ingredient) => i.id === ingredientId);
      if (!ingredient) return state;

      const newPrep: PrepItem = {
        uid: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ingredientId
      };
      
      return {
        ...state,
        prepItems: [...state.prepItems, newPrep]
      };
    }

    case ActionType.START_COOKING: {
      const prepUid = action.payload;
      const prepItem = state.prepItems.find((p: PrepItem) => p.uid === prepUid);
      if (!prepItem) return state;

      const ingredient = state.ingredients.find((i: Ingredient) => i.id === prepItem.ingredientId);
      if (!ingredient) return state;

      const newCooking: CookingItem = {
        uid: prepItem.uid,
        ingredientId: prepItem.ingredientId,
        startTime: Date.now(),
        duration: ingredient.seconds,
        isDone: false
      };

      return {
        ...state,
        prepItems: state.prepItems.filter((p: PrepItem) => p.uid !== prepUid),
        cookingItems: [...state.cookingItems, newCooking]
      };
    }

    case ActionType.START_COOKING_COPY: {
      const prepUid = action.payload;
      const prepItem = state.prepItems.find((p: PrepItem) => p.uid === prepUid);
      if (!prepItem) return state;

      const ingredient = state.ingredients.find((i: Ingredient) => i.id === prepItem.ingredientId);
      if (!ingredient) return state;

      const newCooking: CookingItem = {
        uid: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ingredientId: prepItem.ingredientId,
        startTime: Date.now(),
        duration: ingredient.seconds,
        isDone: false
      };

      return {
        ...state,
        cookingItems: [...state.cookingItems, newCooking]
      };
    }

    case ActionType.FINISH_COOKING: {
      return {
        ...state,
        cookingItems: state.cookingItems.map((item: CookingItem) => 
          item.uid === action.payload ? { ...item, isDone: true } : item
        )
      };
    }

    case ActionType.REMOVE_COOKING: {
      const itemUid = action.payload;
      const itemToRemove = state.cookingItems.find((item: CookingItem) => item.uid === itemUid);
      
      let updatedIngredients = state.ingredients;
      
      if (itemToRemove && itemToRemove.isDone) {
         updatedIngredients = state.ingredients.map((i: Ingredient) => {
            if (i.id === itemToRemove.ingredientId) {
                return { ...i, usageCount: (i.usageCount || 0) + 1 };
            }
            return i;
         });
      }

      return {
        ...state,
        ingredients: updatedIngredients,
        cookingItems: state.cookingItems.filter((item: CookingItem) => item.uid !== itemUid)
      };
    }

    case ActionType.MOVE_COOKING_BACK_TO_PREP: {
      const itemUid = action.payload;
      const itemToMove = state.cookingItems.find((item: CookingItem) => item.uid === itemUid);
      if (!itemToMove) return state;

      const newPrep: PrepItem = {
        uid: itemToMove.uid,
        ingredientId: itemToMove.ingredientId
      };

      return {
        ...state,
        cookingItems: state.cookingItems.filter((item: CookingItem) => item.uid !== itemUid),
        prepItems: [...state.prepItems, newPrep]
      };
    }
    
    case ActionType.REMOVE_PREP: {
        return {
            ...state,
            prepItems: state.prepItems.filter((item: PrepItem) => item.uid !== action.payload)
        };
    }

    case ActionType.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      };

    case ActionType.UPDATE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.map((i: Ingredient) => i.id === action.payload.id ? action.payload : i)
      };

    case ActionType.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((i: Ingredient) => i.id !== action.payload)
      };

    case ActionType.IMPORT_DATA:
      return {
        ...state,
        ingredients: action.payload
      };

    case ActionType.SET_ADMIN_AUTH:
      return {
        ...state,
        admin: { ...state.admin, isAuthenticated: action.payload }
      };

    case ActionType.SET_ADMIN_SETUP:
        return {
            ...state,
            admin: { ...state.admin, isSetup: action.payload }
        };

    case ActionType.TOGGLE_PIN:
        return {
            ...state,
            ingredients: state.ingredients.map((i: Ingredient) => 
                i.id === action.payload ? { ...i, isPinned: !i.isPinned } : i
            )
        };

    case ActionType.SET_HAS_SEEN_GUIDE:
        localStorage.setItem(GUIDE_KEY, 'true');
        return {
            ...state,
            hasSeenGuide: true
        };

    default:
      return state;
  }
};

const DataContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedAdmin = localStorage.getItem(ADMIN_KEY);
    const savedGuide = localStorage.getItem(GUIDE_KEY);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch({ 
          type: ActionType.LOAD_DATA, 
          payload: { 
            ingredients: parsed.ingredients || DEFAULT_INGREDIENTS,
            prepItems: parsed.prepItems || [],
            cookingItems: [], 
            admin: {
                isSetup: !!savedAdmin,
                isAuthenticated: false
            },
            hasSeenGuide: !!savedGuide
          } 
        });
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      ingredients: state.ingredients,
      prepItems: state.prepItems,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [state.ingredients, state.prepItems]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

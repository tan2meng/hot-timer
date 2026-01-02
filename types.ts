
export enum IngredientType {
  MEAT = '肉类',
  VEGETABLE = '素菜',
  SEAFOOD = '海鲜',
  NOODLE = '主食',
  OTHER = '其他'
}

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  seconds: number;
  type: IngredientType;
  usageCount: number;
  isPinned?: boolean;
}

export interface PrepItem {
  uid: string;
  ingredientId: string;
}

export interface CookingItem {
  uid: string;
  ingredientId: string;
  startTime: number;
  duration: number;
  isDone: boolean;
}

export interface AdminState {
  isSetup: boolean;
  isAuthenticated: boolean;
}

export interface AppState {
  ingredients: Ingredient[];
  prepItems: PrepItem[];
  cookingItems: CookingItem[];
  admin: AdminState;
  hasSeenGuide: boolean;
}

export enum ActionType {
  LOAD_DATA = 'LOAD_DATA',
  ADD_TO_PREP = 'ADD_TO_PREP',
  START_COOKING = 'START_COOKING',
  START_COOKING_COPY = 'START_COOKING_COPY',
  FINISH_COOKING = 'FINISH_COOKING',
  REMOVE_COOKING = 'REMOVE_COOKING',
  MOVE_COOKING_BACK_TO_PREP = 'MOVE_COOKING_BACK_TO_PREP',
  REMOVE_PREP = 'REMOVE_PREP',
  ADD_INGREDIENT = 'ADD_INGREDIENT',
  UPDATE_INGREDIENT = 'UPDATE_INGREDIENT',
  DELETE_INGREDIENT = 'DELETE_INGREDIENT',
  IMPORT_DATA = 'IMPORT_DATA',
  SET_ADMIN_AUTH = 'SET_ADMIN_AUTH',
  SET_ADMIN_SETUP = 'SET_ADMIN_SETUP',
  TOGGLE_PIN = 'TOGGLE_PIN',
  SET_HAS_SEEN_GUIDE = 'SET_HAS_SEEN_GUIDE'
}

export interface Action {
  type: ActionType;
  payload?: any;
}

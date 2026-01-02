import { Ingredient, IngredientType } from './types';

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: '1', name: '肥牛', emoji: '🥩', seconds: 15, type: IngredientType.MEAT, usageCount: 0 },
  { id: '2', name: '羊肉卷', emoji: '🥓', seconds: 20, type: IngredientType.MEAT, usageCount: 0 },
  { id: '3', name: '毛肚', emoji: '🥘', seconds: 10, type: IngredientType.MEAT, usageCount: 0 },
  { id: '4', name: '撒尿牛丸', emoji: '🍡', seconds: 300, type: IngredientType.MEAT, usageCount: 0 },
  { id: '5', name: '虾滑', emoji: '🦐', seconds: 180, type: IngredientType.SEAFOOD, usageCount: 0 },
  { id: '6', name: '鱼片', emoji: '🐟', seconds: 60, type: IngredientType.SEAFOOD, usageCount: 0 },
  { id: '7', name: '菠菜', emoji: '🥬', seconds: 45, type: IngredientType.VEGETABLE, usageCount: 0 },
  { id: '8', name: '土豆片', emoji: '🥔', seconds: 240, type: IngredientType.VEGETABLE, usageCount: 0 },
  { id: '9', name: '藕片', emoji: '🥯', seconds: 180, type: IngredientType.VEGETABLE, usageCount: 0 },
  { id: '10', name: '面条', emoji: '🍜', seconds: 240, type: IngredientType.NOODLE, usageCount: 0 },
  { id: '11', name: '豆皮', emoji: '🫔', seconds: 90, type: IngredientType.OTHER, usageCount: 0 },
  { id: '12', name: '鸭血', emoji: '🧊', seconds: 300, type: IngredientType.MEAT, usageCount: 0 },
  { id: '13', name: '鹌鹑蛋', emoji: '🥚', seconds: 120, type: IngredientType.OTHER, usageCount: 0 },
];

export const CATEGORIES = [
  IngredientType.MEAT,
  IngredientType.SEAFOOD,
  IngredientType.VEGETABLE,
  IngredientType.NOODLE,
  IngredientType.OTHER
];
# Recipe Recommendation & Scoring Algorithm

## 1. Algorithmic Formulation

The recommendation engine scores and ranks each recipe dynamically based on:
1. Available user ingredients
2. Expiry urgency of those ingredients
3. Leftovers availability
4. Missing required ingredients

```text
Recipe Score = 
    (Match Percentage × 0.55)
    + Expiry Urgency Score
    + Leftover Boost
    - Missing Ingredient Penalty
```

### Parameters Breakdown:
- **`Match Percentage`**: `(Matched Required Ingredients / Total Required Ingredients) × 100`
- **`Expiry Urgency Score`**:
  - Item expires in $\le 1$ day (Critical): $+25.0$ points each
  - Item expires in $2-3$ days (Expiring Soon): $+15.0$ points each
- **`Leftover Boost`**: $+15.0$ points per utilized cooked leftover.
- **`Missing Ingredient Penalty`**: $-8.0$ points per missing required ingredient.
- **`Bounds`**: Final score is clamped between $0.0$ and $100.0$.

## 2. Dynamic Rationale Generation

In addition to the mathematical score, the engine computes a human-readable **Why Recommended?** string explaining:
- Which specific expiring ingredients are saved
- Which leftovers can be repurposed
- Exact percentage of ingredients already in the kitchen

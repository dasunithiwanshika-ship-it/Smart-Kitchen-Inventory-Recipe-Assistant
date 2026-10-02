# AI Architecture & Grounded Intelligence Design

## 1. Design Philosophy: Zero Hallucinations

In food and kitchen management, an AI must **never hallucinate food items** that the user does not possess.

The AI layer in Smart Kitchen AI adheres to these core architectural principles:
1. **Context Grounding**: Every prompt or recommendation calculation is grounded by real-time querying of the user's isolated database partition.
2. **Provider Agnostic Abstraction**: The `AIService` module contains a clean provider layer supporting built-in rules engines, OpenAI GPT-4o, and Google Gemini.
3. **Data Sufficiency Transparency**: In ML prediction models, if historical data is insufficient (less than threshold logs), the system explicitly states "Insufficient historical logs" rather than presenting false confidence.

```text
┌────────────────────────────────────────┐
│             User Request               │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│     Inventory State Retrieval         │
│  - Live pantry items                   │
│  - Storage locations                   │
│  - Expiry date countdowns              │
│  - Active cooked leftovers             │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│        Grounded Context Prompt         │
│  "User currently has:                  │
│   - Tomato (expires tomorrow)          │
│   - Chicken Breast (expires in 2 days) │
│   - Leftover Rice (cooked yesterday)"  │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│      Recommendation & Response         │
└────────────────────────────────────────┘
```

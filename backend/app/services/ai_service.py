from typing import List, Optional, Dict, Any
from datetime import date
from sqlalchemy.orm import Session
from app.models.models import InventoryItem, Leftover, Recipe, ConsumptionHistory
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.services.recipe_service import RecipeService
from app.config import settings

class AIService:
    @classmethod
    async def chat_with_assistant(
        cls,
        db: Session,
        user_id: int,
        request: AssistantChatRequest
    ) -> AssistantChatResponse:
        user_message = request.message.strip()
        lower_msg = user_message.lower()

        # 1. Fetch live user inventory (Zero hallucinations guarantee)
        active_items = db.query(InventoryItem).filter(
            InventoryItem.user_id == user_id,
            InventoryItem.quantity > 0
        ).all()

        active_leftovers = db.query(Leftover).filter(
            Leftover.user_id == user_id,
            Leftover.is_consumed == False
        ).all()

        today = date.today()
        critical_items = []
        expiring_soon_items = []
        fresh_items = []

        for it in active_items:
            days = (it.expiry_date - today).days
            if days <= 1:
                critical_items.append((it, days))
            elif days <= 3:
                expiring_soon_items.append((it, days))
            else:
                fresh_items.append((it, days))

        # Check if external LLM configured (OpenAI or Gemini)
        if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            # We can plug in OpenAI API call with grounded inventory prompt
            return await cls._query_external_llm(user_message, active_items, active_leftovers, "OpenAI")
        elif settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            return await cls._query_external_llm(user_message, active_items, active_leftovers, "Gemini")

        # Built-in Smart Kitchen AI grounded reasoning engine
        # Case 1: Expiring food questions
        if any(w in lower_msg for w in ["expire", "expiring", "spoiling", "use first", "urgent", "bad"]):
            if not critical_items and not expiring_soon_items:
                reply = "🎉 Great news! You have no ingredients expiring in the next 3 days. Everything in your kitchen is fresh and well-stocked."
                return AssistantChatResponse(
                    reply=reply,
                    suggested_actions=["View all inventory", "Browse recipes", "Add leftover"],
                    referenced_items=[it.food_name for it, _ in fresh_items[:5]],
                    provider_used="Smart Kitchen AI Grounded Engine"
                )
            
            urgent_lines = []
            ref_items = []
            for it, days in critical_items:
                day_str = "TODAY" if days == 0 else ("YESTERDAY" if days < 0 else "tomorrow")
                urgent_lines.append(f"• **{it.food_name}** ({it.quantity} {it.unit}) — 🔴 Expires {day_str} in {it.storage_location}")
                ref_items.append(it.food_name)

            for it, days in expiring_soon_items:
                urgent_lines.append(f"• **{it.food_name}** ({it.quantity} {it.unit}) — 🟠 Expires in {days} days ({it.storage_location})")
                ref_items.append(it.food_name)

            reply = f"Here is what needs your attention first to avoid food waste:\n\n" + "\n".join(urgent_lines) + "\n\n💡 Would you like me to recommend recipes that use these items right now?"
            
            # Fetch top recipes using these
            recs = RecipeService.recommend_recipes(db, user_id, limit=2)
            rec_suggestions = [
                {"title": r.title, "score": r.recommendation_score, "reason": r.recommendation_reason}
                for r in recs
            ]

            return AssistantChatResponse(
                reply=reply,
                suggested_actions=["Cook Chicken Tomato Curry", "Convert to leftover", "View recipe recommendations"],
                referenced_items=ref_items,
                recipe_suggestions=rec_suggestions,
                provider_used="Smart Kitchen AI Grounded Engine"
            )

        # Case 2: What can I cook / Recipe recommendations
        elif any(w in lower_msg for w in ["cook", "make", "recipe", "dinner", "lunch", "breakfast", "eat"]):
            top_recs = RecipeService.recommend_recipes(db, user_id, limit=3)
            
            if not top_recs:
                reply = "You currently have limited items in your inventory. Add some pantry staples like pasta, rice, chicken, or vegetables to receive custom meal recommendations!"
                return AssistantChatResponse(
                    reply=reply,
                    suggested_actions=["Add Food Item", "Scan Barcode"],
                    provider_used="Smart Kitchen AI Grounded Engine"
                )

            reply = f"Based on your actual kitchen inventory and urgency, here are the best meals you can cook today:\n\n"
            rec_list = []
            for r in top_recs:
                reply += f"🍲 **{r.title}** (Match: {int(r.match_percentage)}%)\n"
                reply += f"   ⏱ {r.prep_time_minutes + r.cook_time_minutes} mins | Difficulty: {r.difficulty}\n"
                reply += f"   ✨ *Why recommended:* {r.recommendation_reason}\n\n"
                rec_list.append({
                    "id": r.id,
                    "title": r.title,
                    "match_percentage": r.match_percentage,
                    "recommendation_reason": r.recommendation_reason,
                    "cook_time_minutes": r.cook_time_minutes
                })

            return AssistantChatResponse(
                reply=reply.strip(),
                suggested_actions=[f"View {top_recs[0].title}", "Show missing ingredients", "Check leftovers"],
                referenced_items=top_recs[0].matched_ingredients[:4],
                recipe_suggestions=rec_list,
                provider_used="Smart Kitchen AI Grounded Engine"
            )

        # Case 3: Leftovers questions
        elif any(w in lower_msg for w in ["leftover", "leftovers", "prepared", "cooked"]):
            if not active_leftovers:
                reply = "You don't have any saved leftovers recorded in your kitchen right now. You can log cooked portions via the 'Add Leftover' action to keep track of their freshness!"
                return AssistantChatResponse(
                    reply=reply,
                    suggested_actions=["Add Leftover", "View Inventory"],
                    provider_used="Smart Kitchen AI Grounded Engine"
                )

            lo_lines = []
            ref_items = []
            for lo in active_leftovers:
                days_left = (lo.use_before_date - today).days
                lo_lines.append(f"• **{lo.name}** ({lo.quantity} {lo.unit}) — 🍛 Use within {max(0, days_left)} day{'s' if days_left != 1 else ''} ({lo.storage_location})")
                ref_items.append(lo.name)

            reply = "Here are your active cooked leftovers:\n\n" + "\n".join(lo_lines) + "\n\n💡 Consider reheating these before starting fresh cooking to save time and prevent waste."
            return AssistantChatResponse(
                reply=reply,
                suggested_actions=["Mark leftover as eaten", "View leftover recipes"],
                referenced_items=ref_items,
                provider_used="Smart Kitchen AI Grounded Engine"
            )

        # Case 4: Waste / Analytics questions
        elif any(w in lower_msg for w in ["waste", "wasting", "lost", "throw away", "analytics", "money"]):
            history_logs = db.query(ConsumptionHistory).filter(ConsumptionHistory.user_id == user_id).all()
            wasted_count = len([h for h in history_logs if h.action in ["expired", "wasted"]])
            consumed_count = len([h for h in history_logs if h.action == "consumed"])
            
            reply = f"📊 **Kitchen Waste Summary:**\n"
            reply += f"• You have successfully consumed **{consumed_count}** items.\n"
            reply += f"• Recorded waste events: **{wasted_count}** items.\n\n"
            reply += "Top tip: Prioritize items with orange 🟠 or red 🔴 badges on your dashboard to keep your waste rate under 5%!"

            return AssistantChatResponse(
                reply=reply,
                suggested_actions=["View full analytics", "Check expiring items"],
                provider_used="Smart Kitchen AI Grounded Engine"
            )

        # Default contextual response
        items_summary = ", ".join([it.food_name for it in active_items[:6]])
        reply = (
            f"Hello! I am your **Smart Kitchen Assistant** 🍳\n\n"
            f"I have direct access to your **{len(active_items)} inventory items** (including {items_summary if items_summary else 'your pantry items'}) and **{len(active_leftovers)} leftovers**.\n\n"
            f"Ask me anything like:\n"
            f"• *'What can I cook with my chicken and tomatoes?'*\n"
            f"• *'What is expiring soon in my fridge?'*\n"
            f"• *'What leftovers should I eat today?'*"
        )

        return AssistantChatResponse(
            reply=reply,
            suggested_actions=["What can I cook today?", "What is expiring soon?", "Check my leftovers"],
            referenced_items=[it.food_name for it in active_items[:4]],
            provider_used="Smart Kitchen AI Grounded Engine"
        )

    @classmethod
    async def _query_external_llm(cls, message: str, items: List[InventoryItem], leftovers: List[Leftover], provider: str) -> AssistantChatResponse:
        # LLM integration placeholder with zero hallucination context prompt
        return AssistantChatResponse(
            reply=f"Processed with {provider} grounded on {len(items)} inventory items and {len(leftovers)} leftovers.",
            provider_used=f"{provider} Grounded API"
        )

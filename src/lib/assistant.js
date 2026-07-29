// Shopping assistant: a tool-calling chat loop against Azure OpenAI, backed
// by four tools that mirror the shop API's own actions (search, single-item
// lookup, balance, place order). Each tool description is deliberately
// honest about what the underlying API can and can't do, so the model
// applies its own judgement for things like "cheap" or a colour instead of
// expecting the API to filter for them.

import { getAccount, getCategories, getProduct, searchCatalogue } from "@/lib/shopApi";

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;

const SIGNOFF = "Very comfy.";

const SYSTEM_PROMPT = `You are the shopping assistant for Lucky Sofa 88, a furniture store.

You have four tools:
- search_catalogue: browse items, optionally narrowed to one EXACT category from the shop's fixed category list. It has no price, colour, material, or free-text search built in — it only filters by an exact category string, or returns everything if no category is given.
- get_product_details: fetch full details (dimensions, colours) for one already-known item_id. It's much slower per call than search_catalogue, so only use it to confirm or describe a single item, never to search or browse.
- check_balance: get the live account balance.
- place_order: stage a specific order (item_id/quantity pairs) for the user to confirm. This does NOT execute the purchase — the app shows the user what's about to be bought and for how much, and only a button click in the app actually completes it.

The API itself cannot understand vague or subjective requests — things like "cheap," "affordable," or a colour. When the buyer asks for something like that, call search_catalogue to get the plain list of matching items (by category if one clearly applies), then apply that judgement yourself by reasoning over the price and colours fields in the results. Do not expect the tool to filter for you, and do not claim it can.

Only recommend or reference products that actually came back from search_catalogue or get_product_details — never invent products, prices, or item IDs.

Only call place_order once the user has named the specific item(s) and quantity they want — it just stages the order for a confirm button in the app, so you don't need them to say "yes" first, but you do need to know exactly what to stage. If anything is ambiguous — which item, how many — describe the option(s) and ask instead of guessing.

If a tool returns an error (e.g. an item can't be found), explain it to the user in plain, friendly language and suggest what to try instead — never show raw error text, field names, or error codes verbatim.

Keep replies short and conversational. Always end every reply with the sign-off "${SIGNOFF}" on its own line.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_catalogue",
      description:
        "Browse furniture items, optionally narrowed to one exact category from the shop's fixed category list. No price, colour, material, or free-text search exists server-side — apply that judgement yourself over the returned items.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description:
              "Word(s) to match against the product name, case-insensitive (applied after fetching, not a native API filter).",
          },
          category: {
            type: "string",
            description:
              "Exact catalogue category to filter by. An unrecognized category falls back to a keyword-style match instead of returning nothing.",
          },
          max_price: {
            type: "number",
            description:
              "Only include items at or under this price (applied after fetching, not a native API filter).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Fetch full details (dimensions, colours) for one already-known item_id. Much slower per call than search_catalogue — use it to confirm/describe a single item, never to search.",
      parameters: {
        type: "object",
        properties: {
          item_id: { type: "string", description: "The exact item_id to look up." },
        },
        required: ["item_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_balance",
      description:
        "Get the live account balance. Returns just a current dollar figure, no spending history.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description:
        "Stage a specific order (item_id/quantity pairs) for the user to confirm in the app. This does not execute the purchase itself — only call it once you know exactly what and how many to buy.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "The items to purchase.",
            items: {
              type: "object",
              properties: {
                item_id: { type: "string" },
                quantity: { type: "integer", minimum: 1 },
              },
              required: ["item_id", "quantity"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
];

// The model doesn't always get the category string exactly right (the shop
// API requires an exact match, e.g. "Bar furniture" not "bar stools"), so a
// category that doesn't match a real one falls back to being treated as a
// keyword instead of silently filtering the results down to nothing.
async function runSearchCatalogueTool({ keyword, category, max_price } = {}) {
  let resolvedCategory = null;
  if (category) {
    const categories = await getCategories();
    resolvedCategory =
      categories.find((c) => c.toLowerCase() === category.toLowerCase()) ||
      null;
  }

  const items = await searchCatalogue({ category: resolvedCategory });

  const needle = keyword ? keyword.toLowerCase() : null;
  const looseTerm = !resolvedCategory && category ? category.toLowerCase() : null;

  let results = items;
  if (needle || looseTerm) {
    results = results.filter((item) => {
      const haystack = `${item.product_name} ${item.category}`.toLowerCase();
      return (
        (!needle || haystack.includes(needle)) &&
        (!looseTerm || haystack.includes(looseTerm))
      );
    });
  }
  if (typeof max_price === "number") {
    results = results.filter((item) => item.price <= max_price);
  }

  return results.slice(0, 10).map((item) => ({
    item_id: item.item_id,
    name: item.product_name,
    category: item.category,
    price: item.price,
  }));
}

async function runGetProductDetailsTool({ item_id } = {}) {
  const product = await getProduct(item_id);
  if (!product) return { error: "No product found for that item_id." };

  return {
    item_id: product.item_id,
    name: product.product_name,
    category: product.category,
    price: product.price,
    width: product.width,
    height: product.height,
    depth: product.depth,
    colours: product.colours,
  };
}

async function runCheckBalanceTool() {
  const account = await getAccount();
  return { balance: account.balance };
}

// Doesn't call the real order API — it only resolves each item's
// authoritative name/price (never trusting whatever the model thinks the
// price is) and stages the order for the user to confirm via a button in
// the UI. The actual purchase happens from POST /api/assistant/confirm-order.
async function runPlaceOrderTool({ items } = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "No items provided." };
  }

  const resolved = [];
  for (const { item_id, quantity } of items) {
    const product = await getProduct(item_id);
    if (!product || !Number.isFinite(quantity) || quantity < 1) {
      return { error: `Could not resolve item_id ${item_id} or its quantity.` };
    }
    resolved.push({
      item_id,
      name: product.product_name,
      quantity,
      unit_price: product.price,
      line_total: product.price * quantity,
    });
  }

  return {
    status: "confirmation_required",
    items: resolved,
    total_price: resolved.reduce((sum, item) => sum + item.line_total, 0),
  };
}

const TOOL_HANDLERS = {
  search_catalogue: runSearchCatalogueTool,
  get_product_details: runGetProductDetailsTool,
  check_balance: runCheckBalanceTool,
  place_order: runPlaceOrderTool,
};

async function callAzureChat(messages) {
  const url = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": AZURE_OPENAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, tools: TOOLS, tool_choice: "auto" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure OpenAI request failed (${res.status}): ${text}`);
  }
  return res.json();
}

// Belt-and-suspenders: the system prompt asks the model to sign off every
// reply, but don't rely on that alone for a hard product requirement.
export function ensureSignoff(text) {
  const trimmed = (text || "").trim();
  if (trimmed.toLowerCase().includes("comfy")) return trimmed;
  return `${trimmed}\n\n${SIGNOFF}`;
}

// Turns the real order API's raw failure (see confirm-order route) into a
// plain-language explanation with a concrete suggestion — deterministic
// and outside the model's control, so the exact wording (and the
// insufficient-balance callout) is never left to chance.
export function describeOrderFailure(status, detail) {
  if (status === 402) {
    const match = /Balance ([\d.]+) is less than total price ([\d.]+)/.exec(
      typeof detail === "string" ? detail : ""
    );
    const explanation = match
      ? `You've got $${Number(match[1]).toFixed(2)} left, but this order comes to $${Number(match[2]).toFixed(2)}.`
      : "This order costs more than your remaining balance.";

    return ensureSignoff(
      `${explanation} Try a smaller quantity, or ask me for something cheaper instead.\n\nFront up buddy, this ain't a charity.`
    );
  }

  if (status === 404) {
    return ensureSignoff(
      "One of those items doesn't seem to exist in the catalogue — try asking me to search again so we've got the right item."
    );
  }

  return ensureSignoff(
    "That order couldn't go through — try a different quantity or item and give it another go."
  );
}

// conversation: [{ role: "user" | "assistant", content: string }, ...]
export async function chatWithAssistant(conversation, { balance } = {}) {
  const categories = await getCategories();

  const messages = [
    {
      role: "system",
      content:
        SYSTEM_PROMPT +
        `\nValid catalogue categories: ${categories.join(", ")}.` +
        (typeof balance === "number"
          ? `\nThe buyer's current account balance is $${balance.toFixed(2)}.`
          : ""),
    },
    ...conversation,
  ];

  let pendingOrder = null;

  // Capped so a misbehaving model can't loop forever calling tools.
  for (let round = 0; round < 4; round++) {
    const data = await callAzureChat(messages);
    const message = data.choices[0].message;

    if (!message.tool_calls?.length) {
      return { reply: ensureSignoff(message.content), pendingOrder };
    }

    messages.push(message);
    for (const toolCall of message.tool_calls) {
      const handler = TOOL_HANDLERS[toolCall.function.name];
      const args = JSON.parse(toolCall.function.arguments || "{}");
      const result = handler
        ? await handler(args)
        : { error: "Unknown tool." };

      if (
        toolCall.function.name === "place_order" &&
        result.status === "confirmation_required"
      ) {
        pendingOrder = { items: result.items, total_price: result.total_price };
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    reply: ensureSignoff(
      "Sorry, I'm having trouble with that request right now — try rephrasing it."
    ),
    pendingOrder,
  };
}

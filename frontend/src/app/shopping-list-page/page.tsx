"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FaTrash, FaCheckCircle, FaRegCircle } from "react-icons/fa";

// Simple type for shopping list items
type ShoppingItem = {
  id: number;
  name: string;
  done: boolean;
};

// Grouped shopping list
type ShoppingGroup = {
  id: string;
  name: string;
  items: ShoppingItem[];
};

type Unit = {
  id: number;
  name: string;
};

const API_BASE = "http://localhost:8000/api/v1";

export default function ShoppingListPage() {
  // Initial groups with example data
  const [groups, setGroups] = useState<ShoppingGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/shoppinglist/`, {
          headers: {
            Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : ""}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load shopping list");
        }
        const data = await res.json();
        // we expect: [{ id: string, name: string, items: [{ id: number, name: string, done: boolean }] }]
        setGroups(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShoppingList();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_BASE}/shoppinglist/units`, {
          headers: {
            Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : ""}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load units");
        }
        const data = await res.json();
        setUnits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch units", err);
      }
    };
    fetchUnits();
  }, []);

  // Currently active view: "all" or group id
  const [activeView, setActiveView] = useState<string>("all");
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");

  // All items view
  const allItems = useMemo(() => {
    return groups.flatMap((g) =>
      g.items.map((item) => ({ ...item, __groupId: g.id, __groupName: g.name }))
    );
  }, [groups]);

  // List returned based on current group or all, sorted so unchecked come first, then alphabetically by name
  const itemsToShow = (activeView === "all"
    ? allItems
    : groups.find((g) => g.id === activeView)?.items || []
  )
    .slice()
    .sort((a, b) => {
      const doneDiff = Number(a.done) - Number(b.done);
      if (doneDiff !== 0) return doneDiff;
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // send POST to backend to add item to this user's shopping list
  const handleAdd = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    // try to determine recipe_id from active view (only if it's not "all" and looks like a number)
    const recipeIdFromView =
      activeView !== "all" && /^\d+$/.test(activeView) ? Number(activeView) : null;

    try {
      const res = await fetch(`${API_BASE}/shoppinglist/item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token") ?? ""}`
              : "",
        },
        body: JSON.stringify({
          text: trimmed,
          recipe_id: recipeIdFromView,
          quantity: newQuantity ? parseFloat(newQuantity) : null,
          unit_id: selectedUnitId ? parseInt(selectedUnitId) : null,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add item");
      }
      const created = await res.json();

      // figure out which group this item belongs to
      const targetGroupId = created.recipe_id ? String(created.recipe_id) : "others";
      const targetGroupName = created.recipe_id ? created.recipe_name || `Recipe ${created.recipe_id}` : "Others";

      setGroups((prev) => {
        // does the group already exist?
        const groupExists = prev.some((g) => g.id === targetGroupId);
        if (!groupExists) {
          return [
            ...prev,
            {
              id: targetGroupId,
              name: targetGroupName,
              items: [
                {
                  id: created.id,
                  name: created.name,
                  done: created.done,
                  quantity: typeof created.quantity !== "undefined" && created.quantity !== null
                    ? created.quantity
                    : newQuantity
                    ? parseFloat(newQuantity)
                    : undefined,
                  unit: typeof created.unit !== "undefined" && created.unit !== null
                    ? created.unit
                    : selectedUnitId
                    ? (units.find((u) => u.id === Number(selectedUnitId))?.name ?? undefined)
                    : undefined,
                },
              ],
            },
          ];
        }
        return prev.map((g) => {
          if (g.id !== targetGroupId) return g;
          return {
            ...g,
            items: [
              ...g.items,
              {
                id: created.id,
                name: created.name,
                done: created.done,
                quantity: typeof created.quantity !== "undefined" && created.quantity !== null
                  ? created.quantity
                  : newQuantity
                  ? parseFloat(newQuantity)
                  : undefined,
                unit: typeof created.unit !== "undefined" && created.unit !== null
                  ? created.unit
                  : selectedUnitId
                  ? (units.find((u) => u.id === Number(selectedUnitId))?.name ?? undefined)
                  : undefined,
              },
            ],
          };
        });
      });

      setNewItem("");
      setNewQuantity("");
      setSelectedUnitId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (groupId: string, itemId: number) => {
    // find current value
    const currentItem = groups
      .find((g) => g.id === groupId)?.items
      .find((it) => it.id === itemId);
    const currentDone = currentItem ? currentItem.done : false;
    const nextDone = !currentDone;

    // optimistic update
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((item) => (item.id === itemId ? { ...item, done: nextDone } : item)),
        };
      })
    );

    try {
      const res = await fetch(`${API_BASE}/shoppinglist/item/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token") ?? ""}`
              : "",
        },
        body: JSON.stringify({ done: nextDone }),
      });
      if (!res.ok) {
        throw new Error("Failed to update item done state");
      }
      // optionally read response
      // const data = await res.json();
    } catch (err) {
      console.error("Failed to toggle shopping list item", err);
      // revert on error
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            items: g.items.map((item) => (item.id === itemId ? { ...item, done: currentDone } : item)),
          };
        })
      );
    }
  };

  // send DELETE to backend to remove item
  const handleDelete = async (groupId: string, itemId: number) => {
    try {
      await fetch(`${API_BASE}/shoppinglist/item/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token") ?? ""}`
              : "",
        },
      });
    } catch (err) {
      console.error("Failed to delete shopping list item", err);
    }

    // optimistic UI update
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <main className="min-h-screen w-full flex justify-center bg-neutral-50 py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold text-neutral-800">Shopping List</h1>
        </div>

        {/* View switcher (all + groups) */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveView("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              activeView === "all"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            All Items
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveView(g.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                activeView === g.id
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Add new item */}
        <div className="flex gap-2 flex-wrap">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeView === "all" ? "New item" : "New item in this group"
            }
            className="flex-1 min-w-[140px] border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
          />
          <input
            type="number"
            min="0"
            step="0.1"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="Qty"
            className="w-24 border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
          />
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="min-w-[120px] border border-neutral-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
          >
            <option value="">Unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id.toString()}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
            disabled={!newItem.trim()}
          >
            Add
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-neutral-500 text-sm">Loading your shopping list...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : itemsToShow.length === 0 ? (
          <p className="text-neutral-500 text-sm">No items in this view yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {itemsToShow.map((item) => {
              // extra meta in all view
              const groupId = (item as any).__groupId || activeView;
              const groupName = (item as any).__groupName as string | undefined;
              return (
                <li
                  key={`${groupId}-${item.id}`}
                  className="flex items-center justify-between gap-2 bg-neutral-50 rounded-lg border border-neutral-200 px-3 py-2"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      onClick={() => handleToggle(groupId, item.id)}
                      className={`cursor-pointer transition text-2xl ${
                        item.done
                          ? "text-emerald-500 hover:text-emerald-600"
                          : "text-neutral-400 hover:text-neutral-500"
                      }`}
                    >
                      {item.done ? <FaCheckCircle /> : <FaRegCircle />}
                    </span>
                    <div className="flex flex-col">
                      <span className={item.done ? "line-through text-neutral-400" : "text-neutral-700"}>
                        {item.name}
                        {(() => {
                          const q = (item as any).quantity;
                          const num = typeof q === "number" ? q : q != null ? Number(q) : NaN;
                          return !Number.isNaN(num)
                            ? ` - ${num.toFixed(1)}${(item as any).unit ? " " + (item as any).unit : ""}`
                            : "";
                        })()}
                      </span>
                      {activeView === "all" && groupName ? (
                        <span className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 rounded px-2 py-0.5 mt-1 self-start">
                          {groupName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(groupId, item.id)}
                    className="text-xl text-red-500 hover:text-red-600 transition cursor-pointer p-1 rounded"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
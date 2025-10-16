'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

type Recipe = {
    id: number | string;
    title: string;
    image?: string;
    readyInMinutes?: number;
    servings?: number;
    sourceUrl?: string;
    extendedIngredients?: { original: string }[];
    analyzedInstructions?: { steps?: { number: number; step: string }[] }[];
    instructions?: string;
};

export default function RecipeGridClient({ recipes }: { recipes: Recipe[] }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<Recipe | null>(null);

    const onOpen = (r: Recipe) => {
        setActive(r);
        setOpen(true);
    };

    return (
        <>
            {/* GRID */}
            <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] w-full max-w-6xl">
                {recipes.map((r) => (
                    <article key={r.id} className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
                        {r.image && (
                            <div className="relative aspect-[4/3]">
                                <Image src={r.image} alt={r.title} fill className="object-cover" />
                            </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col gap-2">
                            <h3 className="font-medium leading-snug line-clamp-2" title={r.title}>
                                {r.title}
                            </h3>

                            <div className="text-xs text-gray-500 flex gap-3">
                                {typeof r.readyInMinutes === 'number' && <span>⏱️ {r.readyInMinutes} perc</span>}
                                {typeof r.servings === 'number' && <span>🍽️ {r.servings} adag</span>}
                            </div>

                            <button
                                onClick={() => onOpen(r)}
                                className="mt-auto w-full rounded px-3 py-2 text-sm font-medium border bg-gray-50 hover:bg-gray-100 border-gray-200 transition"
                            >
                                View Recipe
                            </button>

                            {r.sourceUrl && (
                                <a
                                    href={r.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                >
                                    Forrás megnyitása ↗
                                </a>
                            )}
                        </div>
                    </article>
                ))}
            </section>

            {/* MODAL (Headless UI Dialog, portal a <body> végére) */}
            <Transition show={open} as={Fragment}>
                <Dialog onClose={() => setOpen(false)} className="relative z-50">
                    {/* háttér */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-150"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </Transition.Child>

                    {/* panel */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-150"
                                enterFrom="opacity-0 translate-y-2 scale-95"
                                enterTo="opacity-100 translate-y-0 scale-100"
                                leave="ease-in duration-100"
                                leaveFrom="opacity-100 translate-y-0 scale-100"
                                leaveTo="opacity-0 translate-y-2 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
                                    {active?.image && (
                                        <div className="relative w-full aspect-[16/9]">
                                            <Image src={active.image} alt={active.title} fill className="object-cover" />
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <Dialog.Title className="text-xl font-semibold leading-tight">
                                                {active?.title}
                                            </Dialog.Title>
                                            <button
                                                onClick={() => setOpen(false)}
                                                aria-label="Close"
                                                className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-600 flex gap-4">
                                            {typeof active?.readyInMinutes === 'number' && (
                                                <span>⏱️ {active.readyInMinutes} perc</span>
                                            )}
                                            {typeof active?.servings === 'number' && (
                                                <span>🍽️ {active.servings} adag</span>
                                            )}
                                        </div>

                                        {/* Hozzávalók */}
                                        <section className="mt-5">
                                            <h3 className="font-medium">Hozzávalók</h3>
                                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                                {(active?.extendedIngredients ?? []).map((ing, idx) => (
                                                    <li key={idx}>{ing.original}</li>
                                                ))}
                                            </ul>
                                        </section>

                                        {/* Elkészítés */}
                                        <section className="mt-5">
                                            <h3 className="font-medium">Elkészítés</h3>
                                            {Array.isArray(active?.analyzedInstructions) &&
                                            active!.analyzedInstructions!.length > 0 ? (
                                                <ol className="list-decimal pl-5 mt-2 space-y-2 text-sm">
                                                    {active!.analyzedInstructions![0].steps?.map((s) => (
                                                        <li key={s.number}>{s.step}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <p className="text-sm mt-2 whitespace-pre-line">
                                                    {active?.instructions || 'Nincs megadott leírás.'}
                                                </p>
                                            )}
                                        </section>

                                        {active?.sourceUrl && (
                                            <a
                                                href={active.sourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-block mt-5 text-sm text-blue-600 hover:underline"
                                            >
                                                Forrás megnyitása ↗
                                            </a>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
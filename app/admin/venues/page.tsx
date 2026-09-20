import { createClient } from "@/lib/supabase/server";
import { createVenue, deleteVenue } from "@/lib/actions/venues";

export default async function VenuesPage() {
    const supabase = await createClient();

    const { data: venues, error } = await supabase
        .from("venues")
        .select("id, name, capacity")
        .order("name");

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    Venues
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Rooms and halls available for scheduling classes.
                </p>
            </div>

            <form
                action={createVenue}
                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-wrap gap-3 items-end mb-6"
            >
                <div className="flex-1 min-w-[200px]">
                    <label className="font-label-sm text-label-sm text-secondary block mb-1">
                        Venue Name
                    </label>
                    <input
                        name="name"
                        required
                        placeholder="LT1, Engineering Hall A"
                        className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="font-label-sm text-label-sm text-secondary block mb-1">
                        Capacity (optional)
                    </label>
                    <input
                        name="capacity"
                        type="number"
                        min={1}
                        placeholder="120"
                        className="h-10 w-32 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button
                    type="submit"
                    className="h-10 px-4 bg-primary text-on-primary rounded font-label-md text-label-md"
                >
                    Save
                </button>
            </form>

            {error && (
                <div className="bg-error-container text-on-error-container rounded-lg p-4 mb-4 font-body-sm text-body-sm">
                    Something went wrong loading venues: {error.message}
                </div>
            )}

            <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-high border-b border-outline-variant">
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Capacity
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                        {!venues || venues.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                >
                                    No venues added yet.
                                </td>
                            </tr>
                        ) : (
                            venues.map((v) => (
                                <tr key={v.id} className="h-12">
                                    <td className="px-4 py-2">{v.name}</td>
                                    <td className="px-4 py-2 tabular-nums">
                                        {v.capacity ?? "—"}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <form action={deleteVenue.bind(null, v.id)}>
                                            <button
                                                type="submit"
                                                className="text-secondary hover:text-error transition-colors p-1"
                                                title="Delete venue"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    delete
                                                </span>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
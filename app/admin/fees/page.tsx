import { createClient } from "@/lib/supabase/server";
import { createFeeStructure, deleteFeeStructure } from "@/lib/actions/fees";

export default async function FeesPage() {
    const supabase = await createClient();

    const [{ data: feeStructures, error }, { data: programmes }, { data: sessions }] =
        await Promise.all([
            supabase
                .from("fee_structures")
                .select("id, level, amount, programmes(name), academic_sessions(name)")
                .order("level"),
            supabase.from("programmes").select("id, name").order("name"),
            supabase
                .from("academic_sessions")
                .select("id, name, is_current")
                .order("start_date", { ascending: false }),
        ]);

    return (
        <>
            <div className="mb-6">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    Fee Structures
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                    Set the fee amount owed per programme, level, and academic session.
                </p>
            </div>

            <form
                action={createFeeStructure}
                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-wrap gap-3 items-end mb-6"
            >
                <div className="flex-1 min-w-[200px]">
                    <label className="font-label-sm text-label-sm text-secondary block mb-1">
                        Programme
                    </label>
                    <select
                        name="programme_id"
                        required
                        className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {programmes?.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-label-sm text-label-sm text-secondary block mb-1">
                        Level
                    </label>
                    <select
                        name="level"
                        required
                        className="h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {[100, 200, 300, 400, 500].map((l) => (
                            <option key={l} value={l}>
                                {l} Level
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="font-label-sm text-label-sm text-secondary block mb-1">
                        Session
                    </label>
                    <select
                        name="session_id"
                        required
                        className="w-full h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {sessions?.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                                {s.is_current ? " (Current)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-label-sm text-label-sm text-secondary block mb-1">
                        Amount (₦)
                    </label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        placeholder="150000"
                        className="h-10 rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary w-40"
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
                    Something went wrong loading fee structures: {error.message}
                </div>
            )}

            <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-high border-b border-outline-variant">
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Programme
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Level
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Session
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-right">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                        {!feeStructures || feeStructures.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-8 px-4 text-center font-body-sm text-body-sm text-secondary"
                                >
                                    No fee structures set yet.
                                </td>
                            </tr>
                        ) : (
                            feeStructures.map((fs) => {
                                const programme = fs.programmes as { name?: string } | null;
                                const session = fs.academic_sessions as {
                                    name?: string;
                                } | null;
                                return (
                                    <tr key={fs.id} className="h-12">
                                        <td className="px-4 py-2">{programme?.name ?? "—"}</td>
                                        <td className="px-4 py-2 tabular-nums">{fs.level}</td>
                                        <td className="px-4 py-2">{session?.name ?? "—"}</td>
                                        <td className="px-4 py-2 tabular-nums">
                                            ₦{Number(fs.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <form action={deleteFeeStructure.bind(null, fs.id)}>
                                                <button
                                                    type="submit"
                                                    className="text-secondary hover:text-error transition-colors p-1"
                                                    title="Delete fee structure"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
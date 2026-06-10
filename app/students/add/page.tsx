import { createStudent } from "@/lib/student";
import Sidebar from "@/components/Sidebar";

export default function AddStudent() {

  async function saveStudent(formData: FormData) {
    "use server";

    await createStudent(
      formData.get("studentNo") as string,
      formData.get("firstName") as string,
      formData.get("lastName") as string,
      Number(formData.get("yearLevel")),
      1
    );
  }

return (
  <main className="min-h-screen bg-slate-950 text-white flex">

    <Sidebar />

    <section className="flex-1 p-8">

      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6">

        ...

      </div>

    </section>

  </main>
);

}